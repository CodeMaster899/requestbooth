import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// DJ user accounts
export const djUsers = pgTable("dj_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre"),
  duration: text("duration"), // Format: "3:45"
  requestCount: integer("request_count").default(0).notNull(),
  songType: text("song_type").notNull().default("dj"), // dj, karaoke, both
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id), // null for manual requests
  songTitle: text("song_title").notNull(),
  songArtist: text("song_artist").notNull(),
  songVersion: text("song_version").notNull().default("Standard"), // Standard or Karaoke
  requestType: text("request_type").notNull().default("dj"), // dj or karaoke
  requesterName: text("requester_name").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, played, skipped, removed
  isManualRequest: boolean("is_manual_request").default(false).notNull(),
  userUuid: text("user_uuid"),
  deviceFingerprint: text("device_fingerprint"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const banList = pgTable("ban_list", {
  id: serial("id").primaryKey(),
  userUuid: text("user_uuid").notNull(),
  deviceFingerprint: text("device_fingerprint"),
  banReason: text("ban_reason").notNull(),
  banTimestamp: timestamp("ban_timestamp").defaultNow(),
  isPermanent: boolean("is_permanent").default(true),
  expiresAt: timestamp("expires_at"),
});

export const termsAcceptance = pgTable("terms_acceptance", {
  id: serial("id").primaryKey(),
  userUuid: text("user_uuid").notNull().unique(),
  deviceFingerprint: text("device_fingerprint"),
  acceptedAt: timestamp("accepted_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const songsRelations = relations(songs, ({ many }) => ({
  requests: many(requests),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  song: one(songs, {
    fields: [requests.songId],
    references: [songs.id],
  }),
}));

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  requestCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  songType: z.enum(["dj", "karaoke", "both"], { required_error: "Please select a song type" }),
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  timestamp: true,
}).extend({
  requesterName: z.string().min(2, "Requester name must be at least 2 characters").max(50, "Name too long"),
  songTitle: z.string().min(2, "Song title must be at least 2 characters").max(100, "Song title too long"),
  songArtist: z.string().min(2, "Artist name must be at least 2 characters").max(100, "Artist name too long"),
  songVersion: z.enum(["Standard", "Karaoke"], { required_error: "Please select a song version" }),
  requestType: z.enum(["dj", "karaoke"], { required_error: "Please select a request type" }),
  notes: z.string().optional(),
});

export const insertBanSchema = createInsertSchema(banList).omit({
  id: true,
  banTimestamp: true,
});

export const insertTermsAcceptanceSchema = createInsertSchema(termsAcceptance).omit({
  id: true,
  acceptedAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const djLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertDJUserSchema = createInsertSchema(djUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DJUser = typeof djUsers.$inferSelect;
export type InsertDJUser = z.infer<typeof insertDJUserSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Ban = typeof banList.$inferSelect;
export type InsertBan = z.infer<typeof insertBanSchema>;
export type TermsAcceptance = typeof termsAcceptance.$inferSelect;
export type InsertTermsAcceptance = z.infer<typeof insertTermsAcceptanceSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type DJLogin = z.infer<typeof djLoginSchema>;

// Additional types for frontend
export type QueueRequest = Request & {
  song?: Song;
};

export type RequestStats = {
  totalRequests: number;
  pending: number;
  completed: number;
  manual: number;
};

export type SystemStatus = {
  requestsEnabled: boolean;
  maintenanceMode: boolean;
  karaokeEnabled: boolean;
};
