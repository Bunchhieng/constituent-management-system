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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);
	const router = useRouter();

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();
		// Implement your sign-up logic here
		console.log("Sign-up attempted with:", {
			name,
			email,
			password,
			agreeTerms,
		});
		router.push("/dashboard");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Create your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Or{" "}
					<Link
						href="/login"
						className="font-medium text-blue-600 hover:text-blue-500"
					>
						sign in to your existing account
					</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<Card className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<CardContent>
						<form onSubmit={handleSignUp} className="space-y-6">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700"
								>
									Full Name
								</label>
								<div className="mt-1">
									<Input
										id="name"
										name="name"
										type="text"
										autoComplete="name"
										required
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
								</div>
							</div>

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
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
										autoComplete="new-password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
								</div>
							</div>

							<div className="flex items-center">
								<Checkbox
									id="agree-terms"
									checked={agreeTerms}
									onCheckedChange={(checked) =>
										setAgreeTerms(checked as boolean)
									}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="agree-terms"
									className="ml-2 block text-sm text-gray-900"
								>
									I agree to the{" "}
									<a
										href="#"
										className="font-medium text-blue-600 hover:text-blue-500"
									>
										Terms of Service
									</a>{" "}
									and{" "}
									<a
										href="#"
										className="font-medium text-blue-600 hover:text-blue-500"
									>
										Privacy Policy
									</a>
								</label>
							</div>

							<div>
								<Button
									type="submit"
									disabled={!agreeTerms}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Sign up
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
