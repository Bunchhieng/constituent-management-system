"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const defaultEmail = "admin@test.com";
		const defaultPassword = "password";
		const base64Credentials = btoa(`${defaultEmail}:${defaultPassword}`);
		try {
			const response = await fetch("http://localhost:3001/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${base64Credentials}`,
				},
				body: JSON.stringify({
					email: defaultEmail,
					password: defaultPassword,
				}),
			});
			if (!response.ok) {
				throw new Error("Failed to login");
			}
			const data = await response.json();
			console.log("Login successful:", data);
			router.push("/dashboard");
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Log in to your account
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<Card className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-6">
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email address
								</label>
								<div className="mt-1">
									<Input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										value={email === "" ? "admin@test.com" : email}
										onChange={(e) => setEmail(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Password
								</label>
								<div className="mt-1">
									<Input
										id="password"
										name="password"
										type="password"
										autoComplete="current-password"
										required
										value={password === "" ? "password" : password}
										onChange={(e) => setPassword(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
									/>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<input
										id="remember-me"
										name="remember-me"
										type="checkbox"
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label
										htmlFor="remember-me"
										className="ml-2 block text-sm text-gray-900"
									>
										Remember me
									</label>
								</div>

								<div className="text-sm">
									<a
										href="#"
										className="font-medium text-blue-600 hover:text-blue-500"
									>
										Forgot your password?
									</a>
								</div>
							</div>

							<div>
								<Button
									type="submit"
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Log in
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
