import { db } from './db';
import { constituents } from './schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

const generateConstituents = async () => {
  const result = await db.select({ count: sql`COUNT(*)` }).from(constituents);
  const count = Number(result[0]?.count) || 0;

  if (count > 0) {
    console.log('Constituents already populated.');
    return;
  }

  const values = Array.from({ length: 500 }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    signUpTime: faker.date.past(),
  }));

  await db.insert(constituents).values(values);

  console.log('500 constituents generated.');
};

generateConstituents();
