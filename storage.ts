import { songs, requests, djUsers, banList, termsAcceptance, systemSettings, type Song, type InsertSong, type Request, type InsertRequest, type Ban, type InsertBan, type TermsAcceptance, type InsertTermsAcceptance, type SystemSettings, type InsertSystemSettings, type QueueRequest, type RequestStats, type DJUser, type DJLogin } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Song management
  getSongs(): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, song: Partial<InsertSong>): Promise<Song | undefined>;
  deleteSong(id: number): Promise<boolean>;
  searchSongs(query: string): Promise<Song[]>;
  incrementSongRequestCount(id: number): Promise<void>;

  // Request management
  getRequests(): Promise<QueueRequest[]>;
  getRequestsByType(type: "dj" | "karaoke"): Promise<QueueRequest[]>;
  getRequest(id: number): Promise<Request | undefined>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: number, status: string): Promise<Request | undefined>;
  deleteRequest(id: number): Promise<boolean>;
  clearCompletedRequests(): Promise<void>;
  clearCompletedRequestsByType(type: "dj" | "karaoke"): Promise<void>;
  clearAllRequests(): Promise<void>;
  getRequestStats(): Promise<RequestStats>;
  getRequestStatsByType(type: "dj" | "karaoke"): Promise<RequestStats>;

  // DJ Authentication
  validateDJLogin(credentials: DJLogin): Promise<DJUser | null>;
  
  // Convert manual request to library song
  addRequestToLibrary(requestId: number): Promise<Song | undefined>;
  
  // Ban management
  getBanList(): Promise<Ban[]>;
  getBan(userUuid: string): Promise<Ban | undefined>;
  createBan(ban: InsertBan): Promise<Ban>;
  deleteBan(id: number): Promise<boolean>;
  banUserAndRemoveRequests(userUuid: string, deviceFingerprint: string | null, banReason: string): Promise<void>;
  checkUserBanStatus(userUuid: string): Promise<Ban | null>;
  
  // Terms acceptance management
  recordTermsAcceptance(acceptance: InsertTermsAcceptance): Promise<TermsAcceptance>;
  checkTermsAcceptance(userUuid: string): Promise<TermsAcceptance | null>;
  clearAllTermsAcceptance(): Promise<void>;
  
  // System settings management
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string): Promise<void>;
  getSystemStatus(): Promise<{ requestsEnabled: boolean; maintenanceMode: boolean }>;
  
  // Initialize system
  initializeSystem(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeSystem(): Promise<void> {
    // Create initial DJ account from environment variables
    const defaultUsername = process.env.INITIAL_DJ_USERNAME || "admin";
    const defaultPassword = process.env.INITIAL_DJ_PASSWORD;
    
    try {
      // Check if any DJ user already exists
      const existingUsers = await db.select().from(djUsers).limit(1);
      
      // Only create initial account if no DJ users exist AND password is provided
      if (existingUsers.length === 0 && defaultPassword) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await db.insert(djUsers).values({
          username: defaultUsername,
          passwordHash: hashedPassword,
        });
        
        console.log(`Initial DJ account created: ${defaultUsername}`);
      } else if (existingUsers.length === 0) {
        console.warn("No DJ users exist and no INITIAL_DJ_PASSWORD provided. Please create a DJ account manually or set environment variables.");
      }
    } catch (error) {
      console.error("DJ user initialization error:", error);
    }
  }

  // Song management
  async getSongs(): Promise<Song[]> {
    const result = await db.select().from(songs).orderBy(songs.title);
    return result;
  }

  async getSong(id: number): Promise<Song | undefined> {
    const result = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    return result[0];
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values(song).returning();
    return newSong;
  }

  async updateSong(id: number, song: Partial<InsertSong>): Promise<Song | undefined> {
    const [updatedSong] = await db
      .update(songs)
      .set({ ...song, updatedAt: new Date() })
      .where(eq(songs.id, id))
      .returning();
    return updatedSong;
  }

  async deleteSong(id: number): Promise<boolean> {
    const result = await db.delete(songs).where(eq(songs.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchSongs(query: string): Promise<Song[]> {
    const result = await db
      .select()
      .from(songs)
      .where(
        or(
          ilike(songs.title, `%${query}%`),
          ilike(songs.artist, `%${query}%`),
          ilike(songs.genre, `%${query}%`)
        )
      )
      .orderBy(songs.title);
    return result;
  }

  async incrementSongRequestCount(id: number): Promise<void> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    if (song) {
      await db
        .update(songs)
        .set({ requestCount: song.requestCount + 1 })
        .where(eq(songs.id, id));
    }
  }

  // Request management
  async getRequests(): Promise<QueueRequest[]> {
    const result = await db
      .select({
        id: requests.id,
        songId: requests.songId,
        songTitle: requests.songTitle,
        songArtist: requests.songArtist,
        songVersion: requests.songVersion,
        requestType: requests.requestType,
        requesterName: requests.requesterName,
        notes: requests.notes,
        status: requests.status,
        isManualRequest: requests.isManualRequest,
        userUuid: requests.userUuid,
        deviceFingerprint: requests.deviceFingerprint,
        timestamp: requests.timestamp,
        song: {
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          genre: songs.genre,
          duration: songs.duration,
          requestCount: songs.requestCount,
          songType: songs.songType,
          createdAt: songs.createdAt,
          updatedAt: songs.updatedAt,
        },
      })
      .from(requests)
      .leftJoin(songs, eq(requests.songId, songs.id))
      .orderBy(requests.timestamp);

    return result.map(row => ({
      id: row.id,
      songId: row.songId,
      songTitle: row.songTitle,
      songArtist: row.songArtist,
      songVersion: row.songVersion,
      requestType: row.requestType,
      requesterName: row.requesterName,
      notes: row.notes,
      status: row.status,
      isManualRequest: row.isManualRequest,
      userUuid: row.userUuid,
      deviceFingerprint: row.deviceFingerprint,
      timestamp: row.timestamp,
      song: row.song?.id ? row.song : undefined,
    }));
  }

  async getRequestsByType(type: "dj" | "karaoke"): Promise<QueueRequest[]> {
    const result = await db
      .select({
        id: requests.id,
        songId: requests.songId,
        songTitle: requests.songTitle,
        songArtist: requests.songArtist,
        songVersion: requests.songVersion,
        requestType: requests.requestType,
        requesterName: requests.requesterName,
        notes: requests.notes,
        status: requests.status,
        isManualRequest: requests.isManualRequest,
        userUuid: requests.userUuid,
        deviceFingerprint: requests.deviceFingerprint,
        timestamp: requests.timestamp,
        song: {
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          genre: songs.genre,
          duration: songs.duration,
          requestCount: songs.requestCount,
          songType: songs.songType,
          createdAt: songs.createdAt,
          updatedAt: songs.updatedAt,
        },
      })
      .from(requests)
      .leftJoin(songs, eq(requests.songId, songs.id))
      .where(eq(requests.requestType, type))
      .orderBy(requests.timestamp);

    return result.map(row => ({
      id: row.id,
      songId: row.songId,
      songTitle: row.songTitle,
      songArtist: row.songArtist,
      songVersion: row.songVersion,
      requestType: row.requestType,
      requesterName: row.requesterName,
      notes: row.notes,
      status: row.status,
      isManualRequest: row.isManualRequest,
      userUuid: row.userUuid,
      deviceFingerprint: row.deviceFingerprint,
      timestamp: row.timestamp,
      song: row.song?.id ? row.song : undefined,
    }));
  }

  async getRequest(id: number): Promise<Request | undefined> {
    const result = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
    return result[0];
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [newRequest] = await db.insert(requests).values(request).returning();
    
    // Increment song request count if it's not a manual request
    if (request.songId) {
      await this.incrementSongRequestCount(request.songId);
    }
    
    return newRequest;
  }

  async updateRequestStatus(id: number, status: string): Promise<Request | undefined> {
    const [updatedRequest] = await db
      .update(requests)
      .set({ status })
      .where(eq(requests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteRequest(id: number): Promise<boolean> {
    const result = await db.delete(requests).where(eq(requests.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCompletedRequests(): Promise<void> {
    await db.delete(requests).where(
      or(
        eq(requests.status, "played"),
        eq(requests.status, "skipped")
      )
    );
  }

  async clearCompletedRequestsByType(type: "dj" | "karaoke"): Promise<void> {
    await db.delete(requests).where(
      and(
        or(
          eq(requests.status, "played"),
          eq(requests.status, "skipped")
        ),
        eq(requests.requestType, type)
      )
    );
  }

  async clearAllRequests(): Promise<void> {
    await db.delete(requests);
  }

  async getRequestStats(): Promise<RequestStats> {
    const allRequests = await db.select().from(requests);
    return {
      totalRequests: allRequests.length,
      pending: allRequests.filter(r => r.status === "pending").length,
      completed: allRequests.filter(r => r.status === "played").length,
      manual: allRequests.filter(r => r.isManualRequest).length,
    };
  }

  async getRequestStatsByType(type: "dj" | "karaoke"): Promise<RequestStats> {
    const allRequests = await db.select().from(requests).where(eq(requests.requestType, type));
    return {
      totalRequests: allRequests.length,
      pending: allRequests.filter(r => r.status === "pending").length,
      completed: allRequests.filter(r => r.status === "played").length,
      manual: allRequests.filter(r => r.isManualRequest).length,
    };
  }

  async validateDJLogin(credentials: DJLogin): Promise<DJUser | null> {
    const [user] = await db
      .select()
      .from(djUsers)
      .where(eq(djUsers.username, credentials.username))
      .limit(1);

    if (!user) return null;

    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    return isValid ? user : null;
  }

  async addRequestToLibrary(requestId: number): Promise<Song | undefined> {
    const request = await this.getRequest(requestId);
    if (!request || !request.isManualRequest) return undefined;

    // Create song from manual request
    const newSong = await this.createSong({
      title: request.songTitle,
      artist: request.songArtist,
      genre: null,
      duration: null,
      songType: request.requestType === 'karaoke' ? 'karaoke' : 'dj',
    });

    // Update the request to link to the new song
    await db
      .update(requests)
      .set({ 
        songId: newSong.id,
        isManualRequest: false 
      })
      .where(eq(requests.id, requestId));

    return newSong;
  }

  // Ban management methods
  async getBanList(): Promise<Ban[]> {
    try {
      return await db.select().from(banList).orderBy(desc(banList.banTimestamp));
    } catch (error) {
      console.error("Error fetching ban list:", error);
      return [];
    }
  }

  async getBan(userUuid: string): Promise<Ban | undefined> {
    try {
      const [ban] = await db.select().from(banList).where(eq(banList.userUuid, userUuid));
      return ban || undefined;
    } catch (error) {
      console.error("Error fetching ban:", error);
      return undefined;
    }
  }

  async createBan(ban: InsertBan): Promise<Ban> {
    const [newBan] = await db.insert(banList).values(ban).returning();
    return newBan;
  }

  async deleteBan(id: number): Promise<boolean> {
    try {
      const result = await db.delete(banList).where(eq(banList.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Error deleting ban:", error);
      return false;
    }
  }

  async banUserAndRemoveRequests(userUuid: string, deviceFingerprint: string | null, banReason: string): Promise<void> {
    try {
      // Create ban entry
      await db.insert(banList).values({
        userUuid,
        deviceFingerprint,
        banReason,
      });

      // Remove all requests from this user
      await db.delete(requests).where(eq(requests.userUuid, userUuid));
    } catch (error) {
      console.error("Error banning user and removing requests:", error);
      throw error;
    }
  }

  async checkUserBanStatus(userUuid: string): Promise<Ban | null> {
    try {
      const [ban] = await db.select().from(banList).where(eq(banList.userUuid, userUuid));
      
      // Check if ban exists and if it's still active
      if (!ban) return null;
      
      // If it's a temporary ban, check if it has expired
      if (!ban.isPermanent && ban.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(ban.expiresAt);
        if (now > expiresAt) {
          // Ban has expired, remove it
          await this.deleteBan(ban.id);
          return null;
        }
      }
      
      return ban;
    } catch (error) {
      console.error("Error checking user ban status:", error);
      return null;
    }
  }

  // Terms acceptance management methods
  async recordTermsAcceptance(acceptance: InsertTermsAcceptance): Promise<TermsAcceptance> {
    try {
      const [recorded] = await db.insert(termsAcceptance).values(acceptance).returning();
      return recorded;
    } catch (error) {
      console.error("Error recording terms acceptance:", error);
      throw error;
    }
  }

  async checkTermsAcceptance(userUuid: string): Promise<TermsAcceptance | null> {
    try {
      const [acceptance] = await db.select().from(termsAcceptance).where(eq(termsAcceptance.userUuid, userUuid));
      return acceptance || null;
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
      return null;
    }
  }

  async clearAllTermsAcceptance(): Promise<void> {
    try {
      await db.delete(termsAcceptance);
    } catch (error) {
      console.error("Error clearing terms acceptance:", error);
      throw error;
    }
  }

  // System settings management
  async getSystemSetting(key: string): Promise<string | null> {
    try {
      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
      return setting?.value || null;
    } catch (error) {
      console.error("Error getting system setting:", error);
      return null;
    }
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    try {
      await db.insert(systemSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value, updatedAt: new Date() }
        });
    } catch (error) {
      console.error("Error setting system setting:", error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<{ requestsEnabled: boolean; maintenanceMode: boolean; karaokeEnabled: boolean }> {
    try {
      const requestsEnabled = await this.getSystemSetting('requests_enabled');
      const maintenanceMode = await this.getSystemSetting('maintenance_mode');
      // Check environment variable for karaoke feature flag
      const karaokeEnabled = process.env.KARAOKE_ENABLED === 'true';
      
      return {
        requestsEnabled: requestsEnabled !== 'false',
        maintenanceMode: maintenanceMode === 'true',
        karaokeEnabled
      };
    } catch (error) {
      console.error("Error getting system status:", error);
      return { requestsEnabled: true, maintenanceMode: false, karaokeEnabled: false };
    }
  }
}

export const storage = new DatabaseStorage();
