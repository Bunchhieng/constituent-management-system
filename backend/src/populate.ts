import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { constituents } from "./schema";

const generateConstituents = async () => {
	const result = await db.select({ count: sql`COUNT(*)` }).from(constituents);
	const count = Number(result[0]?.count) || 0;

	if (count >= 500) {
		console.log("Constituents already populated.");
	} else {
		const numToGenerate = 500 - count;
		const values = Array.from({ length: numToGenerate }, () => ({
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			phone: faker.phone.number(),
			signUpTime: faker.date.past(),
		}));

		if (values.length > 0) {
			await db.insert(constituents).values(values);
			console.log(`${numToGenerate} constituents generated.`);
		} else {
			console.log("No new constituents needed to be generated.");
		}
	}
};

generateConstituents().then(() => {
	console.log("Population check complete.");
	process.exit(0);
});
