ALTER TABLE `assignment_submissions` ADD `content` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `lecturer_id` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `content` text;