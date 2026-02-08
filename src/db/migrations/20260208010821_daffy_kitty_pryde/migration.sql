CREATE TABLE `travel_flights` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`aircraft_type` text NOT NULL,
	`airline` text NOT NULL,
	`date` text NOT NULL,
	`flight_number` text NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	CONSTRAINT `travel_flights_date_flight_number_from_unique` UNIQUE(`date`,`flight_number`,`from`)
);
