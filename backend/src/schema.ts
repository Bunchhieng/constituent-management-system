import { pgSchema, serial, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
export const mySchema = pgSchema("constituents");
export const constituents = mySchema.table('constituents', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  signUpTime: timestamp('sign_up_time').defaultNow().notNull(),
  updatedTime: timestamp('updated_time').defaultNow().notNull(),
  active: integer('active').default(0).notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  dateOfBirth: timestamp('date_of_birth'),
  preferredContactMethod: text('preferred_contact_method'),
  lastContactDate: timestamp('last_contact_date'),
  notes: text('notes'),
  tags: text('tags').array(),
});

export const issues = mySchema.table('issues', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  count: integer('count').notNull().default(0), 
});

export const constituentIssues = mySchema.table('constituent_issues', {
  id: serial('id').primaryKey(),
  constituentId: integer('constituent_id').references(() => constituents.id),
  issueId: integer('issue_id').references(() => issues.id),
  priority: integer('priority'),
  dateAdded: timestamp('date_added').defaultNow().notNull(),
});
