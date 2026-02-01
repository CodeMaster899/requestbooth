import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongSchema, insertRequestSchema, djLoginSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database system and create DJ account
  await storage.initializeSystem();

  // DJ Authentication Middleware
  const requireDJ = (req: any, res: any, next: any) => {
    if (req.session?.user?.role === 'dj') {
      return next();
    }
    return res.status(401).json({ message: "DJ authentication required" });
  };
  // Song routes
  app.get("/api/songs", async (req, res) => {
    try {
      const { search } = req.query;
      let songs;
      
      if (search && typeof search === "string") {
        songs = await storage.searchSongs(search);
      } else {
        songs = await storage.getSongs();
      }
      
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const song = await storage.getSong(id);
      
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch song" });
    }
  });

  app.post("/api/songs", async (req, res) => {
    try {
      const songData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(songData);
      res.status(201).json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid song data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  app.put("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const songData = insertSongSchema.partial().parse(req.body);
      const song = await storage.updateSong(id, songData);
      
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      res.json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid song data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update song" });
    }
  });

  app.delete("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSong(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  // Request routes
  app.get("/api/requests", async (req, res) => {
    try {
      const { type } = req.query;
      let requests;
      
      if (type === "dj" || type === "karaoke") {
        requests = await storage.getRequestsByType(type as "dj" | "karaoke");
      } else {
        requests = await storage.getRequests();
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      // CRITICAL: Strict validation for live gig - NO EMPTY FIELDS ALLOWED
      const { songTitle, songArtist, songVersion, requestType, requesterName, notes, songId, status, isManualRequest, userUuid, deviceFingerprint } = req.body;
      
      // Check if user is banned
      if (userUuid) {
        const ban = await storage.checkUserBanStatus(userUuid);
        if (ban) {
          return res.status(403).json({ 
            status: "banned", 
            message: "You have been permanently banned for violating Terms of Service.",
            banReason: ban.banReason,
            banTimestamp: ban.banTimestamp
          });
        }
      }
      
      // Validate required fields with proper error messages
      if (!requesterName || typeof requesterName !== 'string' || requesterName.trim().length < 2) {
        return res.status(400).json({ 
          message: "Requester name is required and must be at least 2 characters",
          field: "requesterName"
        });
      }
      
      if (!songTitle || typeof songTitle !== 'string' || songTitle.trim().length < 2) {
        return res.status(400).json({ 
          message: "Song title is required and must be at least 2 characters",
          field: "songTitle"
        });
      }
      
      if (!songArtist || typeof songArtist !== 'string' || songArtist.trim().length < 2) {
        return res.status(400).json({ 
          message: "Artist name is required and must be at least 2 characters",
          field: "songArtist"
        });
      }

      // Create validated request data
      const requestData = {
        songId: songId || null,
        songTitle: songTitle.trim(),
        songArtist: songArtist.trim(),
        songVersion: songVersion,
        requestType: requestType || "dj", // Default to dj for backward compatibility
        requesterName: requesterName.trim(),
        notes: notes || null,
        status: status || "pending",
        isManualRequest: isManualRequest || false,
        userUuid: userUuid || null,
        deviceFingerprint: deviceFingerprint || null,
      };

      const request = await storage.createRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.put("/api/requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "played", "skipped", "removed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateRequestStatus(id, status);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  app.delete("/api/requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRequest(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete request" });
    }
  });

  app.delete("/api/requests/completed", async (req, res) => {
    try {
      const { type } = req.query;
      
      if (type === "dj" || type === "karaoke") {
        await storage.clearCompletedRequestsByType(type as "dj" | "karaoke");
      } else {
        await storage.clearCompletedRequests();
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear completed requests" });
    }
  });

  app.delete("/api/requests", async (req, res) => {
    try {
      await storage.clearAllRequests();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear all requests" });
    }
  });

  app.get("/api/requests/stats", async (req, res) => {
    try {
      const { type } = req.query;
      let stats;
      
      if (type === "dj" || type === "karaoke") {
        stats = await storage.getRequestStatsByType(type as "dj" | "karaoke");
      } else {
        stats = await storage.getRequestStats();
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch request stats" });
    }
  });

  // Ban management routes
  app.get("/api/bans", async (req, res) => {
    try {
      const bans = await storage.getBanList();
      res.json(bans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ban list" });
    }
  });

  app.post("/api/bans", async (req, res) => {
    try {
      const { userUuid, deviceFingerprint, banReason } = req.body;
      
      if (!userUuid || !banReason) {
        return res.status(400).json({ message: "User UUID and ban reason are required" });
      }

      await storage.banUserAndRemoveRequests(userUuid, deviceFingerprint, banReason);
      res.status(201).json({ message: "User banned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.delete("/api/bans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBan(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Ban not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove ban" });
    }
  });

  app.get("/api/bans/check/:userUuid", async (req, res) => {
    try {
      const { userUuid } = req.params;
      const ban = await storage.checkUserBanStatus(userUuid);
      
      if (ban) {
        res.json({ 
          status: "banned", 
          message: "Access to this service has been restricted due to violations of our Terms of Service. Please contact support if you believe this is an error.",
          banReason: ban.banReason,
          banTimestamp: ban.banTimestamp,
          ban: ban
        });
      } else {
        res.json({ status: "allowed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to check ban status" });
    }
  });

  // Terms acceptance management routes
  app.post("/api/terms/accept", async (req, res) => {
    try {
      const { userUuid, deviceFingerprint } = req.body;
      
      if (!userUuid) {
        return res.status(400).json({ message: "User UUID is required" });
      }

      // Check if already accepted
      const existing = await storage.checkTermsAcceptance(userUuid);
      if (existing) {
        return res.json({ message: "Terms already accepted", acceptance: existing });
      }

      const acceptance = await storage.recordTermsAcceptance({
        userUuid,
        deviceFingerprint: deviceFingerprint || null,
      });
      
      res.status(201).json({ message: "Terms accepted successfully", acceptance });
    } catch (error) {
      res.status(500).json({ message: "Failed to record terms acceptance" });
    }
  });

  app.get("/api/terms/check/:userUuid", async (req, res) => {
    try {
      const { userUuid } = req.params;
      const acceptance = await storage.checkTermsAcceptance(userUuid);
      
      res.json({ 
        hasAccepted: !!acceptance,
        acceptance: acceptance || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check terms acceptance" });
    }
  });

  app.delete("/api/terms/clear", async (req, res) => {
    try {
      await storage.clearAllTermsAcceptance();
      res.json({ message: "All terms acceptance records cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear terms acceptance records" });
    }
  });

  // System settings routes
  app.get("/api/system/status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting system status:", error);
      res.status(500).json({ message: "Failed to get system status" });
    }
  });

  app.post("/api/system/setting", requireDJ, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      // Auto-cleanup when requests are disabled (event turned off)
      if (key === "requests_enabled" && value === "false") {
        console.log("Event turned off - performing automatic cleanup...");
        
        // Clear all terms acceptance records (optimize database storage)
        await storage.clearAllTermsAcceptance();
        console.log("Terms acceptance records cleared");
        
        // Clear all requests from previous event (keep system efficient)
        await storage.clearAllRequests();
        console.log("Request queue cleared");
      }
      
      await storage.setSystemSetting(key, value);
      // Important: Do not destroy or modify session during setting changes
      res.json({ message: "Setting updated successfully" });
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // DJ Override for disabled system
  app.post("/api/system/override", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Authenticate DJ
      const dj = await storage.validateDJLogin({ username, password });
      if (!dj) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set DJ session for immediate access (no persistent override)
      (req as any).session.user = { id: dj.id, role: 'dj' };

      res.status(204).send();
    } catch (error) {
      console.error("Error during DJ override:", error);
      res.status(500).json({ message: "Override failed" });
    }
  });

  // Check current authentication status
  app.get("/api/auth/me", (req: any, res) => {
    res.json({ 
      isDJ: req.session?.user?.role === 'dj',
      overrideActive: req.session?.overrideActive || false 
    });
  });

  // DJ Authentication
  app.post("/api/auth/dj", async (req, res) => {
    try {
      const credentials = djLoginSchema.parse(req.body);
      const user = await storage.validateDJLogin(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ authenticated: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid credentials", errors: error.errors });
      }
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
