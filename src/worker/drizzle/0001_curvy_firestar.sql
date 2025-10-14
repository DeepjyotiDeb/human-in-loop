CREATE TABLE `workflows` (
	`workflow_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_state` text NOT NULL,
	`context_data` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`next_step_id` integer
);
--> statement-breakpoint
DROP TABLE `posts`;