"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from "chart.js";
import { ChartData } from "chart.js";
import { format } from "date-fns";
import { MoreHorizontal, X } from "lucide-react";
import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";
import { Mail, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Toaster, toast } from "react-hot-toast";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
);

type Constituent = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	signUpTime: string;
};

type NewConstituent = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	signUpTime: string;
	firstNameError?: string;
	lastNameError?: string;
	emailError?: string;
	phoneError?: string;
};

type Issue = {
	id: string;
	name: string;
	count: number;
	trend: "up" | "down" | "stable";
	percentage: number;
};

type PhoneAreaCode = {
	areaCode: string;
	count: number;
};

import dotenv from "dotenv";
dotenv.config();

export default function Dashboard() {
	const router = useRouter();
	const [constituents, setConstituents] = useState<Constituent[]>([]);
	const [newConstituent, setNewConstituent] = useState<NewConstituent>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		signUpTime: "",
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] = useState("firstName");
	const [sortOrder, setSortOrder] = useState("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(100);
	const [currentTab, setCurrentTab] = useState("list");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedConstituents, setSelectedConstituents] = useState<number[]>(
		[],
	);
	const [suggestions, setSuggestions] = useState<Constituent[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [editingConstituent, setEditingConstituent] =
		useState<Constituent | null>(null);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [chartData, setChartData] = useState<ChartData<"bar">>({
		labels: [],
		datasets: [],
	});
	const [pieChartData, setPieChartData] = useState<ChartData<"pie">>({
		labels: [],
		datasets: [],
	});
	const [locationChartData, setLocationChartData] = useState<ChartData<"bar">>({
		labels: [],
		datasets: [],
	});
	const [topIssues, setTopIssues] = useState<Issue[]>([]);
	const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [emailSubject, setEmailSubject] = useState("");
	const [emailBody, setEmailBody] = useState("");
	const [exportDateRange, setExportDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});
	const [showExportCalendar, setShowExportCalendar] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);
	const [phoneAreaCodeData, setPhoneAreaCodeData] = useState<PhoneAreaCode[]>(
		[],
	);

	const fetchConstituents = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/constituents?page=${currentPage}&limit=${itemsPerPage}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch constituents");
			}
			const data = await response.json();
			setConstituents(data);
			setHasMoreData(data.length === itemsPerPage);
		} catch (error) {
			console.error("Error fetching constituents:", error);
			toast.error("Failed to fetch constituents");
		}
	}, [currentPage, itemsPerPage]);

	useEffect(() => {
		fetchConstituents();
	}, [fetchConstituents]);

	const extractAreaCode = (phone: string): string | null => {
		// Remove all non-digit characters
		const digitsOnly = phone.replace(/\D/g, "");

		// Check if it's a valid US number (at least 10 digits)
		if (digitsOnly.length >= 10) {
			// If it starts with 1, it's likely a country code, so we skip it
			return digitsOnly.startsWith("1")
				? digitsOnly.slice(1, 4)
				: digitsOnly.slice(0, 3);
		}

		return null;
	};

	useEffect(() => {
		const signUpsByMonth = constituents.reduce(
			(acc, c) => {
				const month = new Date(c.signUpTime).getMonth();
				acc[month] = (acc[month] || 0) + 1;
				return acc;
			},
			{} as Record<number, number>,
		);

		const labels = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		const data = labels.map((_, index) => signUpsByMonth[index] || 0);

		setChartData({
			labels,
			datasets: [
				{
					label: "Sign-ups per Month",
					data,
					backgroundColor: "rgba(75, 192, 192, 0.6)",
				},
			],
		});

		const signUpsByMonthPie = constituents.reduce(
			(acc, c) => {
				const month = new Date(c.signUpTime).toLocaleString("default", {
					month: "long",
				});
				acc[month] = (acc[month] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const pieLabels = Object.keys(signUpsByMonthPie);
		const pieData = Object.values(signUpsByMonthPie);

		setPieChartData({
			labels: pieLabels,
			datasets: [
				{
					data: pieData,
					backgroundColor: [
						"#FF6384",
						"#36A2EB",
						"#FFCE56",
						"#4BC0C0",
						"#9966FF",
						"#FF9F40",
						"#FF6384",
						"#36A2EB",
						"#FFCE56",
						"#4BC0C0",
						"#9966FF",
						"#FF9F40",
					],
				},
			],
		});

		const locationData = constituents.reduce(
			(acc, c) => {
				const areaCode = extractAreaCode(c.phone);
				if (areaCode) {
					acc[areaCode] = (acc[areaCode] || 0) + 1;
				}
				return acc;
			},
			{} as Record<string, number>,
		);

		const sortedLocations = Object.entries(locationData)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10);

		setLocationChartData({
			labels: sortedLocations.map(([areaCode]) => areaCode),
			datasets: [
				{
					label: "Constituents by Area Code",
					data: sortedLocations.map(([, count]) => count),
					backgroundColor: "rgba(75, 192, 192, 0.6)",
				},
			],
		});

		const fetchTopIssues = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_SERVER_URL}/top-issues`,
				);
				if (!response.ok) throw new Error("Failed to fetch top issues");
				const data = await response.json();
				setTopIssues(data);
			} catch (error) {
				console.error("Error fetching top issues:", error);
				toast.error("Failed to load top issues");
			}
		};

		fetchTopIssues();
	}, [constituents]);

	useEffect(() => {
		const areaCodeCounts: Record<string, number> = {};
		constituents.forEach((constituent) => {
			const areaCode = extractAreaCode(constituent.phone);
			if (areaCode) {
				areaCodeCounts[areaCode] = (areaCodeCounts[areaCode] || 0) + 1;
			}
		});

		const sortedAreaCodes = Object.entries(areaCodeCounts)
			.map(([areaCode, count]) => ({ areaCode, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		setPhoneAreaCodeData(sortedAreaCodes);
	}, [constituents]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		let error = "";

		if (
			name === "email" &&
			value &&
			!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
		) {
			error = "Invalid email format";
		} else if (
			name === "phone" &&
			value &&
			!/^\+?1?[- ]?\(?[2-9]\d{2}\)?[- ]?\d{3}[- ]?\d{4}$/.test(value)
		) {
			error =
				"Invalid phone number format. Please use the format +X-XXX-XXX-XXXX.";
		}

		if (editingConstituent) {
			setEditingConstituent({
				...editingConstituent,
				[name]: value,
				[`${name}Error`]: error,
			});
		} else {
			setNewConstituent({
				...newConstituent,
				[name]: value,
				[`${name}Error`]: error,
			});
		}
	};

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			try {
				const { firstName, lastName, email, phone } = newConstituent;
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_SERVER_URL}/constituents`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ firstName, lastName, email, phone }),
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					const errorMessage =
						JSON.parse(errorText).error || "Failed to add constituent";
					throw new Error(errorMessage);
				}

				const data = await response.json();
				if (!data) {
					throw new Error("No data received from server");
				}

				setIsDialogOpen(false);
				setNewConstituent({
					firstName: "",
					lastName: "",
					email: "",
					phone: "",
					signUpTime: "",
				});
				toast.success("Constituent added successfully");
				await fetchConstituents();
			} catch (error) {
				console.error("Error adding constituent:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "An error occurred while adding the constituent",
				);
			}
		},
		[newConstituent, setIsDialogOpen, setNewConstituent, fetchConstituents],
	);

	const handleExport = () => {
		setShowExportCalendar(true);
	};

	const handleExportSubmit = () => {
		if (exportDateRange.from && exportDateRange.to) {
			const fromDate = format(exportDateRange.from, "yyyy-MM-dd");
			const toDate = format(exportDateRange.to, "yyyy-MM-dd");
			const downloadUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/constituents/download?from=${fromDate}&to=${toDate}`;
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = `constituents_${fromDate}_to_${toDate}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setShowExportCalendar(false);
		} else {
			toast.error("Please select both start and end dates");
		}
	};

	const handlePopoverClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (value) {
			const filteredSuggestions = constituents.filter(
				(c) =>
					c.firstName.toLowerCase().includes(value.toLowerCase()) ||
					c.lastName.toLowerCase().includes(value.toLowerCase()) ||
					c.email.toLowerCase().includes(value.toLowerCase()) ||
					c.phone.includes(value),
			);
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]);
		}
	};

	const handleSort = (field: string) => {
		setSortField(field);
		setSortOrder(sortOrder === "asc" ? "desc" : "asc");
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			try {
				const formData = new FormData();
				formData.append("file", file);

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_SERVER_URL}/constituents/upload`,
					{
						method: "POST",
						body: formData,
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);

				if (!response.ok) {
					throw new Error("Upload failed");
				}

				const result = await response.json();
				toast.success(result.message);
				fetchConstituents(); // Refresh the constituents list
			} catch (error) {
				console.error("Error uploading file:", error);
				toast.error("Failed to upload CSV file");
			}
		}
	};

	const triggerFileUpload = () => {
		fileInputRef.current?.click();
	};

	const handleSelectConstituent = (id: number) => {
		setSelectedConstituents((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
		);
	};

	const hasSelected = selectedConstituents.length > 0;

	const handleBulkAction = (action: string) => {
		if (action === "delete") {
			setConstituents((prev) =>
				prev.filter((c) => !selectedConstituents.includes(c.id)),
			);
			setSelectedConstituents([]);
		}
	};

	const filteredAndSortedConstituents = constituents
		.filter(
			(c) =>
				c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.phone.includes(searchTerm),
		)
		.sort((a, b) => {
			const aValue = a[sortField as keyof Constituent];
			const bValue = b[sortField as keyof Constituent];
			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortOrder === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}
			return sortOrder === "asc"
				? Number(aValue) - Number(bValue)
				: Number(bValue) - Number(aValue);
		});

	const handleNextPage = () => {
		setCurrentPage((prev) => prev + 1);
	};

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const formatSignUpTime = (signUpTime: string) => {
		return format(new Date(signUpTime), "MMM d, yyyy h:mm a");
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/constituents/${id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: 1 }),
				},
			);
			if (!response.ok) throw new Error("Failed to delete constituent");
			setConstituents((prev) => prev.filter((c) => c.id !== id));
			toast.success("Constituent deleted successfully");
		} catch (error) {
			console.error("Error deleting constituent:", error);
			toast.error("Failed to delete constituent");
		}
	};

	const handleEdit = (constituent: Constituent) => {
		setEditingConstituent(constituent);
		setIsDialogOpen(true);
	};

	const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingConstituent) return;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/constituents/${editingConstituent.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(editingConstituent),
				},
			);
			if (!response.ok) throw new Error("Failed to update constituent");

			setConstituents((prev) =>
				prev.map((c) =>
					c.id === editingConstituent.id ? editingConstituent : c,
				),
			);
			setIsDialogOpen(false);
			setEditingConstituent(null);
			toast.success("Constituent updated successfully");
		} catch (error) {
			console.error("Error updating constituent:", error);
			toast.error("Failed to update constituent");
		}
	};

	const handleLogout = () => {
		// Clear any authentication tokens or user data from local storage
		localStorage.removeItem("authToken"); // Adjust this based on your auth implementation
		// Redirect to login page
		router.push("/login");
	};

	const clearSearch = () => {
		setSearchTerm("");
		setSuggestions([]);
	};

	const handleIssueClick = (issueId: string) => {
		setSelectedIssue(issueId === selectedIssue ? null : issueId);
	};

	const getTrendIcon = (trend: Issue["trend"]) => {
		switch (trend) {
			case "up":
				return <ArrowUp className="w-4 h-4 text-green-500" />;
			case "down":
				return <ArrowDown className="w-4 h-4 text-red-500" />;
			case "stable":
				return <Minus className="w-4 h-4 text-gray-500" />;
		}
	};

	const handleSendEmail = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/send-email`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						recipients:
							selectedConstituents.length > 0 ? selectedConstituents : "all",
						subject: emailSubject,
						body: emailBody,
					}),
				},
			);

			if (!response.ok) throw new Error("Failed to send email");

			toast.success("Email sent successfully");
			setEmailDialogOpen(false);
			setEmailSubject("");
			setEmailBody("");
			setSelectedConstituents([]);
		} catch (error) {
			console.error("Error sending email:", error);
			toast.error("Failed to send email");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<Toaster position="top-right" />
			<div className="w-[70%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
						Constituent Management System
					</h1>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
					>
						Logout
					</button>
				</div>
				<div className="bg-white shadow-xl rounded-2xl overflow-hidden">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex" aria-label="Tabs">
							<button
								onClick={() => setCurrentTab("list")}
								className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
									currentTab === "list"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								Constituents
							</button>
							<button
								onClick={() => setCurrentTab("chart")}
								className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
									currentTab === "chart"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								Dashboard
							</button>
						</nav>
					</div>
					{currentTab === "list" && (
						<div className="p-6">
							<div className="space-y-6">
								<div className="flex justify-between items-center mb-6">
									<div className="relative w-1/3 mr-4">
										<Input
											placeholder="Search constituents..."
											value={searchTerm}
											onChange={handleSearch}
											className="w-full pr-10 text-gray-800 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										/>
										{searchTerm && (
											<button
												onClick={clearSearch}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
											>
												<X size={18} />
											</button>
										)}
										{suggestions.length > 0 && (
											<ul className="absolute bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto w-full z-10">
												{suggestions.map((constituent) => (
													<li
														key={constituent.id}
														className="p-2 hover:bg-gray-200 cursor-pointer text-black"
													>
														{constituent.firstName} {constituent.lastName}
													</li>
												))}
											</ul>
										)}
									</div>
									<div className="flex space-x-3">
										<Popover
											open={showExportCalendar}
											onOpenChange={setShowExportCalendar}
										>
											<PopoverTrigger asChild>
												<Button
													onClick={handleExport}
													variant="outline"
													className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-lg"
												>
													Export CSV
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<div
													ref={popoverRef}
													onClick={handlePopoverClick}
													className="p-4 bg-white rounded-lg shadow-lg"
												>
													<h3 className="text-lg font-semibold text-black mb-2">
														Select Date Range
													</h3>
													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className="block text-sm font-medium text-black mb-1">
																From
															</label>
															<Calendar
																mode="single"
																selected={exportDateRange.from}
																onSelect={(date) =>
																	setExportDateRange((prev) => ({
																		...prev,
																		from: date,
																	}))
																}
																className="rounded-md border text-black"
																classNames={{
																	day_selected:
																		"bg-blue-600 text-white hover:bg-blue-700",
																	day_today: "bg-gray-100 text-gray-900",
																}}
															/>
														</div>
														<div>
															<label className="block text-sm font-medium text-black mb-1">
																To
															</label>
															<Calendar
																mode="single"
																selected={exportDateRange.to}
																onSelect={(date) =>
																	setExportDateRange((prev) => ({
																		...prev,
																		to: date,
																	}))
																}
																className="rounded-md border text-black"
																classNames={{
																	day_selected:
																		"bg-blue-600 text-white hover:bg-blue-700",
																	day_today: "bg-gray-100 text-gray-900",
																}}
															/>
														</div>
													</div>
													<div className="mt-4 flex justify-end">
														<Button
															onClick={handleExportSubmit}
															className="bg-blue-600 text-white hover:bg-blue-700"
														>
															Export
														</Button>
													</div>
												</div>
											</PopoverContent>
										</Popover>
										<Button
											onClick={triggerFileUpload}
											variant="outline"
											className="bg-white text-green-600 border-green-600 hover:bg-green-50 transition-colors duration-200 rounded-lg"
										>
											Upload CSV
										</Button>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleFileUpload}
											className="hidden"
											accept=".csv"
										/>
										<Button
											onClick={() => setIsDialogOpen(true)}
											variant="default"
											className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 rounded-lg"
										>
											Add Constituent
										</Button>
									</div>
								</div>
								<div className="overflow-x-auto rounded-lg shadow">
									<Table>
										<TableHeader>
											<TableRow className="bg-gray-100">
												<TableHead className="font-semibold text-gray-700 py-3 px-4">
													<input
														type="checkbox"
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedConstituents(
																	constituents.map((c) => c.id),
																);
															} else {
																setSelectedConstituents([]);
															}
														}}
													/>
												</TableHead>
												{[
													"First Name",
													"Last Name",
													"Email",
													"Phone",
													"Sign Up Time",
													"Actions",
												].map((header) => (
													<TableHead
														key={header}
														className="font-semibold text-gray-700 py-3 px-4 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
														onClick={() =>
															handleSort(header.toLowerCase().replace(" ", ""))
														}
													>
														{header}{" "}
														{sortField ===
															header.toLowerCase().replace(" ", "") &&
															(sortOrder === "asc" ? "▲" : "▼")}
													</TableHead>
												))}
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredAndSortedConstituents.map(
												(constituent, index) => (
													<TableRow
														key={constituent.id}
														className="hover:bg-gray-50 transition-colors duration-200"
													>
														<TableCell className="text-gray-600 py-3 px-4">
															<input
																type="checkbox"
																checked={selectedConstituents.includes(
																	constituent.id,
																)}
																onChange={(e) =>
																	handleSelectConstituent(constituent.id)
																}
															/>
														</TableCell>
														<TableCell className="text-gray-800 py-3 px-4">
															{constituent.firstName}
														</TableCell>
														<TableCell className="text-gray-800 py-3 px-4">
															{constituent.lastName}
														</TableCell>
														<TableCell className="text-gray-800 py-3 px-4">
															{constituent.email}
														</TableCell>
														<TableCell className="text-gray-800 py-3 px-4">
															{constituent.phone}
														</TableCell>
														<TableCell className="text-gray-800 py-3 px-4">
															{formatSignUpTime(constituent.signUpTime)}
														</TableCell>
														<TableCell className="py-3 px-4">
															<DropdownMenu>
																<DropdownMenuTrigger>
																	<MoreHorizontal className="h-5 w-5 text-gray-500 hover:text-gray-700" />
																</DropdownMenuTrigger>
																<DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
																	<DropdownMenuItem
																		onClick={() => handleEdit(constituent)}
																		className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2 transition-colors duration-200"
																	>
																		Edit
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() => handleDelete(constituent.id)}
																		className="text-red-600 hover:bg-red-50 cursor-pointer px-4 py-2 transition-colors duration-200"
																	>
																		Delete
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												),
											)}
										</TableBody>
									</Table>
								</div>
								<div className="flex justify-between mt-4">
									<Button
										onClick={handlePreviousPage}
										className="text-blue-600 hover:text-blue-800 font-medium"
										disabled={currentPage === 1}
									>
										← Previous
									</Button>
									<Button
										onClick={handleNextPage}
										className="text-blue-600 hover:text-blue-800 font-medium"
										disabled={!hasMoreData}
									>
										Next →
									</Button>
								</div>
							</div>
						</div>
					)}
					{currentTab === "chart" && (
						<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white p-6 rounded-lg shadow-md">
								<h2 className="text-2xl font-bold mb-4 text-gray-800">
									Monthly Sign-ups
								</h2>
								{chartData.labels.length > 0 ? (
									<div className="h-[400px]">
										<Bar
											data={chartData}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												scales: {
													y: {
														beginAtZero: true,
														title: {
															display: true,
															text: "Number of Sign-ups",
														},
													},
													x: {
														title: {
															display: true,
															text: "Month",
														},
													},
												},
											}}
										/>
									</div>
								) : (
									<p className="text-gray-600 text-center">
										No data available for chart
									</p>
								)}
							</div>
							<div className="bg-white p-6 rounded-lg shadow-md">
								<h2 className="text-2xl font-bold mb-4 text-gray-800">
									Sign-ups Distribution
								</h2>
								{pieChartData.labels.length > 0 ? (
									<div className="h-[400px]">
										<Pie
											data={pieChartData}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: {
														position: "right",
													},
													title: {
														display: true,
														text: "Distribution of Sign-ups by Month",
													},
												},
											}}
										/>
									</div>
								) : (
									<p className="text-gray-600 text-center">
										No data available for chart
									</p>
								)}
							</div>
							<div className="bg-white p-6 rounded-lg shadow-md col-span-2">
								<h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
									<TrendingUp className="mr-2" /> Top Issues Tracker
								</h2>
								<div className="space-y-4">
									{topIssues.map((issue) => (
										<div
											key={issue.id}
											className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
										>
											<div className="flex justify-between items-center mb-2">
												<h3 className="text-lg font-semibold">{issue.name}</h3>
												<div className="flex items-center space-x-2">
													<span className="text-sm font-medium">
														{issue.count} mentions
													</span>
													{getTrendIcon(issue.trend)}
												</div>
											</div>
											<Progress value={issue.percentage} className="h-2 mb-2" />
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">
													{issue.percentage}% of total mentions
												</span>
												<Button
													onClick={() => handleIssueClick(issue.id)}
													variant="outline"
													size="sm"
												>
													{selectedIssue === issue.id
														? "Hide Details"
														: "View Details"}
												</Button>
											</div>
											{selectedIssue === issue.id && (
												<div className="mt-4 p-4 bg-gray-50 rounded-md">
													<h4 className="font-semibold mb-2">
														Recent Constituent Comments:
													</h4>
													<ul className="list-disc pl-5 space-y-2">
														<li>Comment 1 about {issue.name}...</li>
														<li>Comment 2 about {issue.name}...</li>
														<li>Comment 3 about {issue.name}...</li>
													</ul>
													<Button className="mt-4" variant="default" size="sm">
														View Full Report
													</Button>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
							<div className="bg-white p-6 rounded-lg shadow-md col-span-2">
								<h2 className="text-2xl font-bold mb-4 text-gray-800">
									Top 10 Area Codes
								</h2>
								{phoneAreaCodeData.length > 0 ? (
									<div className="h-[400px] w-full">
										<Bar
											data={{
												labels: phoneAreaCodeData.map((item) => item.areaCode),
												datasets: [
													{
														label: "Number of Constituents",
														data: phoneAreaCodeData.map((item) => item.count),
														backgroundColor: "rgba(75, 192, 192, 0.6)",
													},
												],
											}}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												scales: {
													y: {
														beginAtZero: true,
														title: {
															display: true,
															text: "Number of Constituents",
														},
													},
													x: {
														title: {
															display: true,
															text: "Area Code",
														},
													},
												},
												plugins: {
													legend: {
														display: false,
													},
												},
											}}
										/>
									</div>
								) : (
									<p className="text-gray-600 text-center">
										No data available for chart
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="space-y-4 bg-gray-100 rounded-lg p-4">
					<DialogTitle className="text-lg font-semibold text-gray-800 text-center">
						{editingConstituent ? "Edit Constituent" : "Add New Constituent"}
					</DialogTitle>
					<form
						onSubmit={editingConstituent ? handleUpdate : handleSubmit}
						className="space-y-4 p-4"
					>
						<Input
							id="firstName"
							name="firstName"
							placeholder="First Name"
							onChange={handleInputChange}
							value={
								editingConstituent
									? editingConstituent.firstName
									: newConstituent.firstName
							}
							required
							className="border p-2 rounded-md bg-white text-gray-800 w-full"
						/>
						{newConstituent.firstNameError && (
							<div className="text-red-500 text-sm mt-1 block text-left">
								{newConstituent.firstNameError}
							</div>
						)}
						<Input
							id="lastName"
							name="lastName"
							placeholder="Last Name"
							onChange={handleInputChange}
							value={
								editingConstituent
									? editingConstituent.lastName
									: newConstituent.lastName
							}
							required
							className="border p-2 rounded-md bg-white text-gray-800 w-full"
						/>
						{newConstituent.lastNameError && (
							<div className="text-red-500 text-sm mt-1 block text-left">
								{newConstituent.lastNameError}
							</div>
						)}
						<Input
							id="email"
							name="email"
							placeholder="Email"
							onChange={handleInputChange}
							value={
								editingConstituent
									? editingConstituent.email
									: newConstituent.email
							}
							required
							className="border p-2 rounded-md bg-white text-gray-800 w-full"
						/>
						{newConstituent.emailError && (
							<div className="text-red-500 text-sm mt-1 block text-left">
								{newConstituent.emailError}
							</div>
						)}
						<Input
							id="phone"
							name="phone"
							placeholder="Phone"
							onChange={handleInputChange}
							value={
								editingConstituent
									? editingConstituent.phone
									: newConstituent.phone
							}
							required
							className="border p-2 rounded-md bg-white text-gray-800 w-full"
						/>
						{newConstituent.phoneError && (
							<div className="text-red-500 text-sm mt-1 block text-left">
								{newConstituent.phoneError}
							</div>
						)}
						<div className="flex justify-center space-x-4">
							<Button
								type="submit"
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-24"
							>
								{editingConstituent ? "Update" : "Add"}
							</Button>
							<Button
								onClick={() => {
									setIsDialogOpen(false);
									setEditingConstituent(null);
								}}
								className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-24"
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			{hasSelected && (
				<div className="relative">
					<button className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 text-black">
						••
					</button>
					<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
						<ul>
							<li
								onClick={() => handleBulkAction("delete")}
								className="p-2 hover:bg-gray-200 cursor-pointer"
							>
								Delete Selected
							</li>
						</ul>
					</div>
				</div>
			)}

			<div className="bg-white p-6 rounded-lg shadow-md mb-6">
				<h2 className="text-xl font-bold mb-4 flex items-center">
					<Users className="mr-2" /> Constituents
				</h2>
				<div className="mb-4 flex justify-between items-center">
					<Button
						onClick={() => {
							setSelectedConstituents([]);
							setEmailDialogOpen(true);
						}}
						className="flex items-center"
					>
						<Mail className="mr-2 h-4 w-4" /> Email All Constituents
					</Button>
					{selectedConstituents.length > 0 && (
						<Button
							onClick={() => setEmailDialogOpen(true)}
							className="flex items-center"
						>
							<Mail className="mr-2 h-4 w-4" /> Email Selected (
							{selectedConstituents.length})
						</Button>
					)}
				</div>
			</div>

			<Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send Email</DialogTitle>
						<DialogDescription>
							Compose your email to{" "}
							{selectedConstituents.length > 0
								? `${selectedConstituents.length} selected`
								: "all"}{" "}
							constituents.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Input
							placeholder="Subject"
							value={emailSubject}
							onChange={(e) => setEmailSubject(e.target.value)}
						/>
						<Textarea
							placeholder="Email body"
							value={emailBody}
							onChange={(e) => setEmailBody(e.target.value)}
							rows={10}
						/>
					</div>
					<DialogFooter>
						<Button onClick={() => setEmailDialogOpen(false)} variant="outline">
							Cancel
						</Button>
						<Button onClick={handleSendEmail}>Send Email</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
