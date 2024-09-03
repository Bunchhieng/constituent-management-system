import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";
import { and, gte, lte } from "drizzle-orm";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { Parser } from "json2csv";
import multer from "multer";
import { authenticate } from "./auth";
import { db } from "./db";
import { constituents } from "./schema";
import { issues } from "./schema";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

interface AuthenticatedRequest extends Request {
	user?: any;
}

// Middleware
const basicAuth = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header missing" });
	}

	const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
		.toString("ascii")
		.split(":");

	if (
		username === process.env.ADMIN_USERNAME &&
		password === process.env.ADMIN_PASSWORD
	) {
		next();
	} else {
		res.status(401).json({ error: "Invalid credentials" });
	}
};

// Route handlers
const loginHandler = (req: AuthenticatedRequest, res: Response) => {
	res.status(200).json({ message: "Login successful" });
};

const getConstituentsHandler = async (req: Request, res: Response) => {
	const { search, sort, filter, page, limit } = req.query;
	let query = db.select().from(constituents);

	if (typeof search === "string") {
		query = query.where(
			db.raw(`first_name ILIKE '%${search}%' OR last_name ILIKE '%${search}%'`),
		);
	}

	if (typeof sort === "string") {
		const [column, direction] = sort.split(":");
		query = query.orderBy(column, direction.toLowerCase() as "asc" | "desc");
	}

	if (typeof filter === "string") {
		const [field, value] = filter.split(":");
		query = query.where(db.raw(`${field} = '${value}'`));
	}

	if (typeof page === "string" && typeof limit === "string") {
		const offset = (parseInt(page) - 1) * parseInt(limit);
		query = query.limit(parseInt(limit)).offset(offset);
	}

	try {
		const result = await query;
		res.json(result);
	} catch (error) {
		res.status(500).json({
			error: "Failed to retrieve constituents",
			details: (error as Error).message,
		});
	}
};

const addConstituentHandler = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { firstName, lastName, email, phone } = req.body;

	try {
		const existingConstituent = await db
			.select()
			.from(constituents)
			.where(eq(constituents.email, email))
			.limit(1);

		if (existingConstituent.length > 0) {
			// Merge the existing constituent with the new data
			const [updatedConstituent] = await db
				.update(constituents)
				.set({
					firstName: firstName || existingConstituent[0].firstName,
					lastName: lastName || existingConstituent[0].lastName,
					phone: phone || existingConstituent[0].phone,
					// Add any other fields that should be updated
				})
				.where(eq(constituents.email, email))
				.returning();

			return res.status(200).json({
				message: "Constituent updated successfully",
				constituent: updatedConstituent,
			});
		}
		// Insert new constituent
		const [newConstituent] = await db
			.insert(constituents)
			.values({ firstName, lastName, email, phone })
			.returning();

		return res.status(201).json({
			message: "Constituent added successfully",
			constituent: newConstituent,
		});
	} catch (error) {
		console.error("Error adding/updating constituent:", error);
		res.status(500).json({
			error: "Failed to add/update constituent",
			details: (error as Error).message,
		});
	}
};

const exportConstituentsCSVHandler = async (req: Request, res: Response) => {
	const { from, to } = req.query;
	let query = db.select().from(constituents);

	if (typeof from === "string" && typeof to === "string") {
		const fromDate = new Date(from);
		const toDate = new Date(to);

		if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime())) {
			query = query.where(
				and(
					gte(constituents.signUpTime, fromDate),
					lte(constituents.signUpTime, toDate),
				),
			);
		} else {
			return res.status(400).json({ error: "Invalid date format" });
		}
	}

	try {
		const result = await query;
		const fields = ["firstName", "lastName", "email", "phone", "signUpTime"];
		const parser = new Parser({ fields });
		const csv = parser.parse(result);

		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=constituents_${from}_to_${to}.csv`,
		);
		res.status(200).send(csv);
	} catch (error) {
		console.error("Error exporting constituents:", error);
		res.status(500).json({
			error: "Failed to export constituents",
			details: (error as Error).message,
		});
	}
};

const updateConstituentStatusHandler = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { status } = req.body;

	if (!id || typeof status !== "number") {
		return res.status(400).json({ error: "Invalid request" });
	}

	try {
		const updateResult = await db("constituents")
			.where("id", id)
			.update("status", status);
		if (updateResult === 0) {
			return res.status(404).json({ error: "Constituent not found" });
		}
		res
			.status(200)
			.json({ message: "Constituent status updated successfully" });
	} catch (error) {
		console.error("Error updating constituent status:", error);
		res.status(500).json({
			error: "Failed to update constituent status",
			details: (error as Error).message,
		});
	}
};

// Routes
const getTopIssuesHandler = async (req: Request, res: Response) => {
	try {
		const topIssues = await db
			.select({
				id: issues.id,
				name: issues.name,
				count: issues.count,
			})
			.from(issues)
			.orderBy(issues.count, "desc")
			.limit(5);

		const totalCount = topIssues.reduce((sum, issue) => sum + issue.count, 0);

		const formattedIssues = topIssues.map((issue) => ({
			id: issue.id,
			name: issue.name,
			count: issue.count,
			trend: "stable",
			percentage: Math.round((issue.count / totalCount) * 100),
		}));

		res.status(200).json(formattedIssues);
	} catch (error) {
		console.error("Error fetching top issues:", error);
		res.status(500).json({
			error: "Failed to fetch top issues",
			details: (error as Error).message,
		});
	}
};

app.post("/login", basicAuth, loginHandler);
app.get("/top-issues", getTopIssuesHandler);
app.get("/constituents", getConstituentsHandler);
app.post(
	"/constituents",
	[
		check("firstName").not().isEmpty(),
		check("lastName").not().isEmpty(),
		check("email").isEmail().withMessage("Invalid email"),
		check("phone")
			.optional()
			.isMobilePhone("any", { strictMode: false })
			.withMessage("Invalid phone number"),
	],
	addConstituentHandler,
);
app.get("/constituents/download", exportConstituentsCSVHandler);
app.post("/constituents/upload", authenticate, (req, res) => {
	const upload = multer({ dest: "uploads/" });

	upload.single("file")(req, res, async (err) => {
		if (err) {
			return res.status(400).json({ error: "File upload failed" });
		}

		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		const filePath = req.file.path;

		try {
			const fileContent = await fs.promises.readFile(filePath, "utf8");
			const results = parse(fileContent, {
				columns: true,
				skip_empty_lines: true,
			});

			for (const row of results) {
				await db.insert(constituents).values({
					firstName: row.firstName,
					lastName: row.lastName,
					email: row.email,
					phone: row.phone,
					signUpTime: new Date().toISOString(),
				});
			}

			await fs.promises.unlink(filePath);

			res
				.status(200)
				.json({ message: "CSV uploaded and processed successfully" });
		} catch (error) {
			console.error("Error processing CSV:", error);
			res.status(500).json({ error: "Failed to process CSV file" });
		}
	});
});
app.patch("/constituents/:id", updateConstituentStatusHandler);
app.get("/constituents/export", exportConstituentsCSVHandler);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
