"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ChevronRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const root = window.document.documentElement;
		if (isDarkMode) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [isDarkMode]);

	const toggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
	};

	return (
		<div
			className={
				"min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative transition-colors duration-300"
			}
		>
			<div className="container mx-auto px-4 py-8">
				<nav className="flex justify-between items-center mb-16">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						ConstituentCMS
					</h1>
					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleDarkMode}
							className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
						>
							{isDarkMode ? (
								<Sun className="h-5 w-5" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</Button>
						<Link
							href="/login"
							className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							Log in
						</Link>
						<Link href="/signup">
							<Button
								variant="outline"
								className="text-red-500 border-red-500 hover:bg-red-100 dark:text-white dark:border-white dark:hover:bg-white/10"
							>
								Sign up
							</Button>
						</Link>
					</div>
				</nav>
				<div className="max-w-5xl mx-auto text-center mb-16">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight"
					>
						Constituent management for the{" "}
						<span className="text-primary dark:text-primary-foreground">
							modern world
						</span>
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-xl text-gray-600 dark:text-gray-300 mb-8"
					>
						Millions of organizations use ConstituentCMS to modernize their
						constituent management systems.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<Link href="/signup">
							<Button
								size="lg"
								className="bg-blue-500 text-white dark:bg-blue-700 dark:text-white hover:bg-blue-600 dark:hover:bg-blue-800 transition-all duration-300 transform hover:scale-105"
							>
								Start now
								<ChevronRight className="ml-2 h-4 w-4 text-white dark:text-white" />
							</Button>
						</Link>
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					className="relative mb-16"
				>
					<div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 opacity-75" />
					<div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-5xl mx-auto">
						<div className="grid md:grid-cols-3 gap-8">
							{[
								{
									title: "Unified platform",
									description:
										"A fully integrated suite of constituent management products",
								},
								{
									title: "Always up-to-date",
									description:
										"Real-time updates and instant data synchronization",
								},
								{
									title: "Developer-friendly",
									description: "Powerful APIs and comprehensive documentation",
								},
							].map((feature, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
								>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
										{feature.title}
									</h3>
									<p className="text-gray-600 dark:text-gray-300">
										{feature.description}
									</p>
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>

				{/* New content section */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 1.2 }}
					className="max-w-5xl mx-auto mb-16"
				>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
						Why choose ConstituentCMS?
					</h2>
					<div className="grid md:grid-cols-2 gap-8">
						{[
							"Streamline your workflow",
							"Enhance constituent engagement",
							"Improve data accuracy",
							"Increase operational efficiency",
							"Customizable to your needs",
							"Secure and compliant",
						].map((benefit, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
								className="flex items-center space-x-3"
							>
								<Check className="h-5 w-5 text-primary dark:text-primary-foreground" />
								<span className="text-gray-700 dark:text-gray-200">
									{benefit}
								</span>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Call to action section */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 1.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
						Ready to transform your constituent management?
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
						Join thousands of organizations already benefiting from
						ConstituentCMS.
					</p>
					<Link href="/signup">
						<Button
							size="lg"
							className="bg-blue-500 text-white dark:bg-blue-700 dark:text-white hover:bg-blue-600 dark:hover:bg-blue-800 transition-all duration-300 transform hover:scale-105"
						>
							Get started for free
							<ChevronRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</motion.div>

				{/* Footer */}
				<footer className="bg-blue-500 py-8 fixed bottom-0 w-full left-0 right-0 mx-auto">
					<div className="container mx-auto text-center">
						<p className="text-white dark:text-white">
							&copy; 2023 ConstituentCMS. All rights reserved.
						</p>
						<div className="flex justify-center mt-4">
							<a
								href="/about"
								className="text-white dark:text-white hover:text-white dark:hover:text-white mx-4"
							>
								About Us
							</a>
							<a
								href="/contact"
								className="text-white dark:text-white hover:text-white dark:hover:text-white mx-4"
							>
								Contact Us
							</a>
							<a
								href="/terms"
								className="text-white dark:text-white hover:text-white dark:hover:text-white mx-4"
							>
								Terms of Service
							</a>
							<a
								href="/privacy"
								className="text-white dark:text-white hover:text-white dark:hover:text-white mx-4"
							>
								Privacy Policy
							</a>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
