import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const forecastCache=sqliteTable('forecast_cache',{
 beach:text('beach').primaryKey(),attemptHour:integer('attempt_hour').notNull(),
 fetchedAt:integer('fetched_at'),body:text('body'),status:text('status').notNull().default('pending')
});
export const beachProfiles=sqliteTable('beach_profiles',{
 id:text('id').primaryKey(),body:text('body').notNull(),updatedAt:integer('updated_at').notNull()
});
export const providerMetadata=sqliteTable('provider_metadata',{
 id:text('id').primaryKey(),body:text('body').notNull(),fetchedAt:integer('fetched_at').notNull()
});
