#!/usr/bin/env node
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let path = require("path");
path = __toESM(path);
let better_sqlite3 = require("better-sqlite3");
better_sqlite3 = __toESM(better_sqlite3);
let url = require("url");
url = __toESM(url);
let fs = require("fs");
fs = __toESM(fs);
let __h3ravel_shared = require("@h3ravel/shared");
__h3ravel_shared = __toESM(__h3ravel_shared);
let axios = require("axios");
axios = __toESM(axios);
let __h3ravel_musket = require("@h3ravel/musket");
__h3ravel_musket = __toESM(__h3ravel_musket);
let ora = require("ora");
ora = __toESM(ora);
let crypto = require("crypto");
crypto = __toESM(crypto);
let __ngrok_ngrok = require("@ngrok/ngrok");
__ngrok_ngrok = __toESM(__ngrok_ngrok);

//#region src/db.ts
let db;
const __dirname$1 = (0, path.dirname)((0, url.fileURLToPath)(require("url").pathToFileURL(__filename).href));
const dirPath = path.default.normalize(path.default.join(__dirname$1, "..", "data"));
(0, fs.mkdirSync)(dirPath, { recursive: true });
/**
* Hook to get or set the database instance.
* 
* @returns 
*/
const useDb = () => {
	return [() => db, (newDb) => {
		db = newDb;
		const [{ journal_mode }] = db.pragma("journal_mode");
		if (journal_mode !== "wal") db.pragma("journal_mode = WAL");
	}];
};
const [getDatabase, setDatabase] = useDb();
setDatabase(new better_sqlite3.default(path.default.join(dirPath, "app.db")));
/**
* Initialize the database
* 
* @param table 
* @returns 
*/
function init() {
	return getDatabase().exec(`
        CREATE TABLE IF NOT EXISTS json_store (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT
        )
    `);
}
/**
* Save a value to the database
* 
* @param key 
* @param value 
* @returns 
*/
function write(key, value) {
	const db$1 = getDatabase();
	if (typeof value === "boolean") value = value ? "1" : "0";
	if (value instanceof Object) value = JSON.stringify(value);
	return db$1.prepare(`INSERT INTO json_store (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `).run(key, value).lastInsertRowid;
}
/**
* Remove a value from the database
* 
* @param key 
* @param table 
* @returns 
*/
function remove(key) {
	return getDatabase().prepare("DELETE FROM json_store WHERE key = ?").run(key).lastInsertRowid;
}
/**
* Read a value from the database
* 
* @param key 
* @returns 
*/
function read(key) {
	const db$1 = getDatabase();
	try {
		const row = db$1.prepare("SELECT * FROM json_store WHERE key = ?").get(key);
		if (row) try {
			return JSON.parse(row.value);
		} catch {
			return row.value;
		}
	} catch {}
	return null;
}

//#endregion
//#region src/hooks.ts
let commandInstance;
/**
* Hook to get or set the current Command instance.
*/
function useCommand() {
	return [() => {
		if (!commandInstance) throw new Error("Commander instance has not been initialized");
		return commandInstance;
	}, (newCommand) => {
		commandInstance = newCommand;
	}];
}
/**
* Hook to get or set the application configuration.
* 
* @returns 
*/
function useConfig() {
	return [() => {
		return read("config") || {
			debug: false,
			apiBaseURL: "https://api.paystack.co",
			timeoutDuration: 3e3
		};
	}, (config) => {
		write("config", config);
		return read("config");
	}];
}
const shortcutUsed = /* @__PURE__ */ new Set();
/**
* Hook to make command shortcuts unique across the application.
* 
* @returns 
*/
function useShortcuts() {
	return [() => Array.from(shortcutUsed).filter((s) => !!s), (shortcut) => {
		if (!shortcut) {
			shortcutUsed.clear();
			return false;
		}
		if (shortcutUsed.has(shortcut)) return false;
		shortcutUsed.add(shortcut);
		return true;
	}];
}

//#endregion
//#region src/axios.ts
const api = axios.default.create({
	baseURL: "https://api.paystack.co",
	headers: { "Content-Type": "application/json" }
});
/**
* Initialize Axios with configuration from the application settings.
*/
const initAxios = () => {
	const [getConfig] = useConfig();
	const config = getConfig();
	api.defaults.baseURL = config.apiBaseURL || "https://api.paystack.co";
	api.defaults.timeout = config.timeoutDuration || 3e3;
};
/**
* Log the full request details if we are not in production
* @param config 
* @returns 
*/
const logInterceptor = (config) => {
	const [getConfig] = useConfig();
	const [command] = useCommand();
	const conf = getConfig();
	const v = command().getVerbosity();
	if (conf.debug || v > 1) {
		console.log("Error Response URL:", axios.default.getUri(config));
		if (conf.debug || v >= 2) {
			console.log("Request URL:", config.url);
			console.log("Request Method:", config.method);
		}
		if (conf.debug || v == 3) {
			console.log("Request Headers:", config.headers);
			console.log("Request Data:", config.data);
		}
	}
	return config;
};
/**
* Log only the relevant parts of the response if we are in not in production
* 
* @param response 
* @returns 
*/
const logResponseInterceptor = (response) => {
	const [getConfig] = useConfig();
	const [command] = useCommand();
	const conf = getConfig();
	const v = command().getVerbosity();
	if (conf.debug || v > 1) {
		const { data, status, statusText, headers } = response;
		console.log("Error Response URL:", axios.default.getUri(response.config));
		if (conf.debug || v >= 2) {
			console.log("Response Data:", data);
			console.log("Response Status:", status);
		}
		if (conf.debug || v === 3) {
			console.log("Response Status Text:", statusText);
			console.log("Response Headers:", headers);
		}
	}
	return response;
};
const logResponseErrorInterceptor = (error) => {
	const [getConfig] = useConfig();
	const [command] = useCommand();
	const conf = getConfig();
	const v = command().getVerbosity();
	if (conf.debug || v > 1) if (error.response) {
		const { data, status, headers } = error.response;
		console.log("Error Response URL:", axios.default.getUri(error.config));
		if (conf.debug || v >= 2) {
			console.log("Error Response Data:", data);
			console.log("Error Response Status:", status);
		}
		if (conf.debug || v === 3) console.log("Error Response Headers:", headers);
	} else console.log("Error Message:", error.message);
	return Promise.reject(error);
};
api.interceptors.request.use(logInterceptor, (error) => Promise.reject(error));
api.interceptors.response.use(logResponseInterceptor, logResponseErrorInterceptor);
var axios_default = api;

//#endregion
//#region src/helpers.ts
const promiseWrapper = (promise) => promise.then((data) => [null, data]).catch((error) => [typeof error === "string" ? error : error.message, null]);
function isJson(val) {
	return val instanceof Array || val instanceof Object ? true : false;
}
function parseURL(uri) {
	if (!uri.startsWith("http")) uri = "http://" + uri;
	return new URL(uri);
}
function getKeys$1(token, type = "secret", domain = "test") {
	return new Promise((resolve, reject) => {
		axios_default.get("/integration/keys", { headers: {
			Authorization: "Bearer " + token,
			"jwt-auth": true
		} }).then((response) => {
			let key = {};
			const keys = response.data.data;
			if (keys.length) {
				for (let i = 0; i < keys.length; i++) if (keys[i].domain === domain && keys[i].type === type) {
					key = keys[i];
					break;
				}
			}
			resolve(key.key);
		}).catch((error) => {
			if (error.response) {
				reject(error.response.data.message);
				return;
			}
			reject(error);
		});
	});
}
async function executeSchema(schema, options) {
	let domain = "test";
	if (options.domain) domain = options.domain;
	const key = await getKeys$1(read("token"), "secret", domain);
	const [getConfig] = useConfig();
	const config = getConfig();
	return new Promise((resolve, reject) => {
		let params = {}, data = {};
		if (schema.method == "GET") params = options;
		if (schema.method == "POST") data = options;
		const pathVars = [...schema.endpoint.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
		if (pathVars.length >= 0) for (const path$2 of pathVars) schema.endpoint = schema.endpoint.replace("{" + path$2 + "}", options[path$2]);
		const url$1 = new URL(schema.endpoint, config.apiBaseURL || "https://api.paystack.co");
		params = {
			...params,
			...Object.fromEntries(url$1.searchParams.entries())
		};
		axios_default.request({
			url: url$1.pathname,
			method: schema.method,
			params,
			data,
			timeout: config.timeoutDuration || 0,
			headers: { Authorization: "Bearer " + key }
		}).then(({ data: data$1 }) => {
			resolve(data$1);
		}).catch((err) => {
			reject(err.response?.data?.message ?? err.response?.message ?? err.message ?? err.statusText);
		});
	});
}
const wait = (ms, callback) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (callback) resolve(callback());
			resolve();
		}, ms);
	});
};
const logger = (str, config = ["green", "italic"]) => {
	return __h3ravel_shared.Logger.log(str, config, false);
};

//#endregion
//#region src/paystack/apis.ts
const APIs = {
	subaccount: [
		{
			api: "update",
			endpoint: "https://api.paystack.co/subaccount",
			method: "PUT",
			params: [],
			description: "Update a subaccount"
		},
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/subaccount/{id}",
			method: "GET",
			params: [{
				parameter: "id",
				required: true,
				type: "String",
				description: "The ID of the subaccount to fetch",
				paramType: "path"
			}],
			description: "Fetch a specific subaccount"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/subaccount",
			method: "GET",
			params: [{
				parameter: "perPage",
				required: false,
				type: "String",
				description: "Specify how many records you want to retrieve per page"
			}, {
				parameter: "page",
				required: false,
				type: "Number",
				description: "Specify exactly what page you want to retrieve"
			}],
			description: "List all sub accounts created on your integration "
		},
		{
			api: "create",
			endpoint: "https://api.paystack.co/subaccount",
			method: "POST",
			params: [
				{
					parameter: "business_name",
					required: true,
					type: "String",
					description: "Name of business for subaccount"
				},
				{
					parameter: "settlement_bank",
					required: true,
					type: "String",
					description: "Bank code (see List Banks endpoint for accepted codes)"
				},
				{
					parameter: "account_number",
					required: true,
					type: "String",
					description: "NUBAN bank account number"
				},
				{
					parameter: "percentage_charge",
					required: true,
					type: "String",
					description: "Default percentage charged when receiving on behalf of this subaccount"
				},
				{
					parameter: "primary_contact_email",
					required: false,
					type: "String",
					description: "Contact email for the subaccount"
				},
				{
					parameter: "primary_contact_name",
					required: false,
					type: "String",
					description: "Contact person name for this subaccount"
				},
				{
					parameter: "primary_contact_phone",
					required: false,
					type: "String",
					description: "Contact phone number for this subaccount"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional information in structured JSON format"
				},
				{
					parameter: "settlement_schedule",
					required: false,
					type: "String",
					description: "Settlement schedule: \"auto\" (T+1), \"weekly\", \"monthly\", or \"manual\""
				}
			],
			description: "Create a new subaccount"
		}
	],
	page: [
		{
			api: "update",
			endpoint: "https://api.paystack.co/page/",
			method: "PUT",
			params: [
				{
					parameter: "name",
					required: false,
					type: "String",
					description: "Name of page"
				},
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Short description of page"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Amount to be charged in kobo. Will override the amount for existing subscriptions"
				},
				{
					parameter: "active",
					required: false,
					type: "String",
					description: "Set to false to deactivate page url"
				}
			],
			description: "Update a payment page"
		},
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/page/id_or_plan_code",
			method: "GET",
			params: [],
			description: "Fetch a specific payment page"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/page",
			method: "GET",
			params: [
				{
					parameter: "perPage",
					required: false,
					type: "String",
					description: "Specify how many records you want to retrieve per page"
				},
				{
					parameter: "page",
					required: false,
					type: "Number",
					description: "Specify exactly what page you want to retrieve"
				},
				{
					parameter: "interval",
					required: false,
					type: "String",
					description: "Filter list by plans with specified interval"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Filter list by plans with specified amount (in kobo)"
				}
			],
			description: "List all payment pages"
		},
		{
			api: "check",
			endpoint: "https://api.paystack.co/page/check_slug_availability/slug",
			method: "GET",
			params: [{
				parameter: "slug",
				required: true,
				type: "String",
				description: "URL slug to be confirmed"
			}],
			description: "Check if a page slug is available"
		},
		{
			api: "create",
			endpoint: "https://api.paystack.co/page",
			method: "POST",
			params: [
				{
					parameter: "name",
					required: true,
					type: "String",
					description: "Name of page"
				},
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Short description of page"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Default amount to accept using this page (leave empty for donations)"
				},
				{
					parameter: "slug",
					required: false,
					type: "String",
					description: "URL slug for the page (page will be accessible at https://paystack.com/pay/[slug])"
				},
				{
					parameter: "redirect_url",
					required: false,
					type: "String",
					description: "URL to redirect to upon successful payment"
				},
				{
					parameter: "send_invoices",
					required: false,
					type: "String",
					description: "Set to false to disable invoice emails"
				},
				{
					parameter: "custom_fields",
					required: false,
					type: "String",
					description: "Custom fields to accept (see documentation for format)"
				}
			],
			description: "Create a new payment page"
		}
	],
	transfer: [
		{
			api: "list",
			endpoint: "https://api.paystack.co/transfer",
			method: "GET",
			params: [{
				parameter: "perPage",
				required: false,
				type: "String",
				description: "Specify how many records you want to retrieve per page"
			}, {
				parameter: "page",
				required: false,
				type: "Number",
				description: "Specify exactly what page you want to retrieve"
			}],
			description: "List all transfers"
		},
		{
			api: "finalize",
			endpoint: "https://api.paystack.co/transfer/finalize_transfer",
			method: "POST",
			params: [{
				parameter: "transfer_code",
				required: true,
				type: "String",
				description: "Transfer code"
			}, {
				parameter: "otp",
				required: true,
				type: "String",
				description: "OTP sent to business phone to verify transfer"
			}],
			description: "Finalize a transfer by confirming OTP"
		},
		{
			api: "initiate",
			endpoint: "https://api.paystack.co/transfer",
			method: "POST",
			params: [
				{
					parameter: "source",
					required: true,
					type: "String",
					description: "Where should we transfer from? Only [balance] for now"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Amount to transfer in kobo"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Specify the currency of the transfer. Defaults to NGN",
					default: "NGN",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "reason",
					required: false,
					type: "String",
					description: "The reason for the transfer."
				},
				{
					parameter: "recipient",
					required: true,
					type: "String",
					description: "Code for transfer recipient."
				},
				{
					parameter: "reference",
					required: false,
					type: "String",
					description: "If specified, the field should be a unique identifier (in lowercase) for the object. Only `-` `,` `_` and alphanumeric characters allowed."
				},
				{
					parameter: "account_reference",
					required: false,
					type: "String",
					description: "A unique identifier required in Kenya for MPESA Paybill and Till transfers."
				}
			],
			description: "Send money to your customers. Status of transfer object returned will be [pending] if OTP is disabled. In the event that an OTP is required, status will read [otp]."
		},
		{
			api: "verify",
			endpoint: "https://api.paystack.co/transfer/{reference}",
			method: "GET",
			params: [
				{
					parameter: "perPage",
					required: false,
					type: "String",
					description: "Specify how many records you want to retrieve per page"
				},
				{
					parameter: "page",
					required: false,
					type: "Number",
					description: "Specify exactly what page you want to retrieve"
				},
				{
					parameter: "reference",
					required: true,
					type: "String",
					description: "Transfer reference to verify",
					paramType: "path"
				}
			],
			description: "Verify transfer status by reference"
		},
		{
			api: "disable",
			endpoint: "https://api.paystack.co/transfer/disable_otp",
			method: "POST",
			params: [],
			description: "Disable OTP requirement for transfers"
		},
		{
			api: "enable",
			endpoint: "https://api.paystack.co/transfer/enable_otp",
			method: "POST",
			params: [],
			description: "Enable OTP requirement for transfers"
		},
		{
			api: "initiate",
			endpoint: "https://api.paystack.co/transfer/bulk",
			method: "POST",
			params: [{
				parameter: "source",
				required: false,
				type: "String",
				description: "Where should we transfer from? Only [balance] for now"
			}, {
				parameter: "transfers",
				required: true,
				type: "Array",
				description: "A list of transfer object.."
			}],
			description: "Batch multiple transfers in a single request. You need to disable the Transfers OTP requirement to use this endpoint."
		},
		{
			api: "finalize",
			endpoint: "https://api.paystack.co/transfer/disable_otp_finalize",
			method: "POST",
			params: [{
				parameter: "otp",
				required: true,
				type: "String",
				description: "OTP sent to business phone to verify disabling OTP requirement"
			}],
			description: "Finalize disabling OTP with confirmation code"
		},
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/transfer/id",
			method: "GET",
			params: [{
				parameter: "id_or_code",
				required: true,
				type: "String",
				description: "An ID or code for the transfer to retrieve"
			}],
			description: "Fetch transfer details by ID or code"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/transfer/id_or_code",
			method: "GET",
			params: [{
				parameter: "perPage",
				required: false,
				type: "String",
				description: "Specify how many records you want to retrieve per page"
			}, {
				parameter: "page",
				required: false,
				type: "Number",
				description: "Specify exactly what page you want to retrieve"
			}],
			description: "List all bulk charge batches"
		},
		{
			api: "resend",
			endpoint: "https://api.paystack.co/transfer/resend_otp",
			method: "POST",
			params: [{
				parameter: "transfer_code",
				required: true,
				type: "String",
				description: "Transfer code"
			}, {
				parameter: "reason",
				required: true,
				type: "String",
				description: "Either \"resend_otp\" or \"transfer\""
			}],
			description: "Resend OTP for a transfer"
		}
	],
	paymentrequest: [
		{
			api: "create",
			endpoint: "https://api.paystack.co/paymentrequest",
			method: "POST",
			params: [
				{
					parameter: "customer",
					required: true,
					type: "String",
					description: "Customer ID or code"
				},
				{
					parameter: "due_date",
					required: true,
					type: "String",
					description: "ISO 8601 representation of request due date"
				},
				{
					parameter: "amount",
					required: true,
					type: "Number",
					description: "Invoice amount in kobo"
				},
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Description of the payment request"
				},
				{
					parameter: "line_items",
					required: false,
					type: "String",
					description: "Array of line items"
				},
				{
					parameter: "tax",
					required: false,
					type: "String",
					description: "Array of taxes to be charged"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency (defaults to NGN)",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "send_notification",
					required: false,
					type: "String",
					description: "Whether to send email notification (defaults to true)"
				},
				{
					parameter: "draft",
					required: false,
					type: "String",
					description: "Save as draft (defaults to false)"
				},
				{
					parameter: "has_invoice",
					required: false,
					type: "String",
					description: "Create a draft invoice even without line items or tax"
				},
				{
					parameter: "invoice_number",
					required: false,
					type: "String",
					description: "Override the auto-incrementing invoice number"
				}
			],
			description: "Create a new payment request"
		},
		{
			api: "finalize",
			endpoint: "https://api.paystack.co/paymentrequest/finalize/ID_OR_CODE",
			method: "POST",
			params: [{
				parameter: "send_notification",
				required: false,
				type: "String",
				description: "Whether to send email notification (defaults to true)"
			}],
			description: "Finalize/publish a draft payment request"
		},
		{
			api: "send",
			endpoint: "https://api.paystack.co/paymentrequest/notify/ID_OR_CODE",
			method: "POST",
			params: [],
			description: "Send payment request notification to customer"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/paymentrequest",
			method: "GET",
			params: [
				{
					parameter: "customer",
					required: false,
					type: "String",
					description: "Filter by customer ID"
				},
				{
					parameter: "status",
					required: false,
					type: "String",
					description: "Filter by status: \"failed\", \"success\", or \"abandoned\""
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Filter by currency",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "paid",
					required: false,
					type: "String",
					description: "Filter requests that have been paid for"
				},
				{
					parameter: "include_archive",
					required: false,
					type: "String",
					description: "Include archived payment requests"
				},
				{
					parameter: "payment_request",
					required: false,
					type: "String",
					description: "Filter by invoice code"
				}
			],
			description: "List all payment requests"
		},
		{
			api: "view",
			endpoint: "https://api.paystack.co/paymentrequest/REQUEST_ID_OR_CODE",
			method: "GET",
			params: [{
				parameter: "id",
				required: true,
				type: "String",
				description: "Payment request ID or code"
			}],
			description: "View a specific payment request"
		},
		{
			api: "invoice",
			endpoint: "https://api.paystack.co/paymentrequest/totals",
			method: "GET",
			params: [],
			description: "Get payment request totals"
		},
		{
			api: "update",
			endpoint: "https://api.paystack.co/paymentrequest/ID_OR_CODE",
			method: "PUT",
			params: [
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Payment request description"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Amount in kobo"
				},
				{
					parameter: "line_item",
					required: false,
					type: "String",
					description: "Line items"
				},
				{
					parameter: "tax",
					required: false,
					type: "String",
					description: "Taxes"
				},
				{
					parameter: "due_date",
					required: false,
					type: "String",
					description: "Due date for the request"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional metadata"
				},
				{
					parameter: "send_notification",
					required: false,
					type: "String",
					description: "Whether to send notification"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency (only works in draft mode)",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "customer",
					required: false,
					type: "String",
					description: "Customer ID (only works in draft mode)"
				}
			],
			description: "Update a payment request"
		},
		{
			api: "verify",
			endpoint: "https://api.paystack.co/paymentrequest/verify/{id}",
			method: "GET",
			params: [{
				parameter: "id",
				required: false,
				type: "String",
				description: "The invoice code for the Payment Request to be verified",
				paramType: "path"
			}],
			description: "Verify details of a payment request on your integration."
		}
	],
	transferrecipient: [
		{
			api: "create",
			endpoint: "https://api.paystack.co/transferrecipient",
			method: "POST",
			params: [
				{
					parameter: "type",
					required: true,
					type: "String",
					description: "Recipient Type",
					options: [
						"nuban",
						"ghipss",
						"mobile_money",
						"basa"
					]
				},
				{
					parameter: "name",
					required: true,
					type: "String",
					description: "A name for the recipient"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional information in structured JSON format"
				},
				{
					parameter: "bank_code",
					required: true,
					type: "String",
					description: "Bank code from the List Banks endpoint"
				},
				{
					parameter: "account_number",
					required: true,
					type: "String",
					description: "Bank account number (required if type is nuban)"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency for the account receiving the transfer",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Description for the recipient"
				}
			],
			description: "Create a new transfer recipient"
		},
		{
			api: "delete",
			endpoint: "https://api.paystack.co/transferrecipient/{id_or_code}",
			method: "DELETE",
			params: [{
				parameter: "id_or_code",
				required: true,
				type: "String",
				description: "Transfer Recipient's ID or code",
				paramType: "path"
			}],
			description: "Delete a transfer recipient"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/transferrecipient",
			method: "GET",
			params: [{
				parameter: "perPage",
				required: false,
				type: "String",
				description: "Specify how many records you want to retrieve per page"
			}, {
				parameter: "page",
				required: false,
				type: "Number",
				description: "Specify exactly what page you want to retrieve"
			}],
			description: "List all transfer recipients"
		},
		{
			api: "update",
			endpoint: "https://api.paystack.co/transferrecipient/{id_or_code}",
			method: "PUT",
			params: [{
				parameter: "id_or_code",
				required: true,
				type: "String",
				description: "Transfer Recipient's ID or code",
				paramType: "path"
			}],
			description: "Update a transfer recipient"
		}
	],
	subscription: [
		{
			api: "disable",
			endpoint: "https://api.paystack.co/subscription/disable",
			method: "POST",
			params: [{
				parameter: "code",
				required: true,
				type: "String",
				description: "Subscription code"
			}, {
				parameter: "token",
				required: true,
				type: "String",
				description: "Email token"
			}],
			description: "Disable a subscription"
		},
		{
			api: "fetch",
			endpoint: ":id_or_subscription_code",
			method: "GET",
			params: [],
			description: "Fetch a specific subscription"
		},
		{
			api: "create",
			endpoint: "https://api.paystack.co/subscription",
			method: "POST",
			params: [
				{
					parameter: "customer",
					required: true,
					type: "String",
					description: "Customer email address or customer code"
				},
				{
					parameter: "plan",
					required: true,
					type: "String",
					description: "Plan code"
				},
				{
					parameter: "authorization",
					required: false,
					type: "String",
					description: "Authorization code (required if customer has multiple authorizations)"
				},
				{
					parameter: "start_date",
					required: false,
					type: "String",
					description: "Start date for the first debit (ISO 8601 format)"
				}
			],
			description: "Create a subscription for a customer"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/subscription",
			method: "GET",
			params: [
				{
					parameter: "perPage",
					required: false,
					type: "String",
					description: "Specify how many records you want to retrieve per page"
				},
				{
					parameter: "page",
					required: false,
					type: "Number",
					description: "Specify exactly what page you want to retrieve"
				},
				{
					parameter: "customer",
					required: false,
					type: "String",
					description: "Filter by Customer ID"
				},
				{
					parameter: "plan",
					required: false,
					type: "String",
					description: "Filter by Plan ID"
				}
			],
			description: "List all subscriptions"
		},
		{
			api: "enable",
			endpoint: "https://api.paystack.co/subscription/enable",
			method: "POST",
			params: [{
				parameter: "code",
				required: true,
				type: "String",
				description: "Subscription code"
			}, {
				parameter: "token",
				required: true,
				type: "String",
				description: "Email token"
			}],
			description: "Enable a subscription"
		}
	],
	bulkcharge: [
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/bulkcharge/id_or_code",
			method: "GET",
			params: [{
				parameter: "id_or_code",
				required: true,
				type: "String",
				description: "An ID or code for the batch whose details you want to retrieve"
			}],
			description: "Fetch a specific bulk charge batch with progress information"
		},
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/bulkcharge/id_or_code/charges",
			method: "GET",
			params: [
				{
					parameter: "id_or_code",
					required: true,
					type: "String",
					description: "An ID or code for the batch whose charges you want to retrieve"
				},
				{
					parameter: "status",
					required: false,
					type: "String",
					description: "Filter by status: \"pending\", \"success\", or \"failed\""
				},
				{
					parameter: "perPage",
					required: false,
					type: "String",
					description: "Specify how many records you want to retrieve per page"
				},
				{
					parameter: "page",
					required: false,
					type: "Number",
					description: "Specify exactly what page you want to retrieve"
				}
			],
			description: "Retrieve all charges associated with a bulk charge batch"
		},
		{
			api: "initiate",
			endpoint: "https://api.paystack.co/bulkcharge",
			method: "POST",
			params: [],
			description: "Initiate a bulk charge by sending an array of authorization codes and amounts"
		},
		{
			api: "resume",
			endpoint: "https://api.paystack.co/bulkcharge/resume/batch_code",
			method: "GET",
			params: [{
				parameter: "batch_code",
				required: true,
				type: "String",
				description: "Code of the batch to resume processing"
			}],
			description: "Resume processing a paused bulk charge batch"
		},
		{
			api: "pause",
			endpoint: "https://api.paystack.co/bulkcharge/pause/batch_code",
			method: "GET",
			params: [{
				parameter: "batch_code",
				required: true,
				type: "String",
				description: "Code of the batch to pause"
			}],
			description: "Pause processing a bulk charge batch"
		}
	],
	bank: [
		{
			api: "list",
			endpoint: "https://api.paystack.co/bank",
			method: "GET",
			params: [],
			description: "List all supported banks"
		},
		{
			api: "resolve",
			endpoint: "https://api.paystack.co/bank/resolve?account_number={account_number}&bank_code={bank_code}",
			method: "GET",
			params: [{
				parameter: "account_number",
				required: true,
				type: "String",
				description: "Bank account number",
				paramType: "path"
			}, {
				parameter: "bank_code",
				required: true,
				type: "String",
				description: "Bank code",
				paramType: "path"
			}],
			description: "Resolve account details by account number and bank code"
		},
		{
			api: "match",
			endpoint: "{account_number}&bank_code={bank_code}&bvn={bvn}",
			method: "GET",
			params: [
				{
					parameter: "account_number",
					required: true,
					type: "String",
					description: "Bank account number",
					paramType: "path"
				},
				{
					parameter: "bank_code",
					required: true,
					type: "String",
					description: "Bank code from List Bank endpoint",
					paramType: "path"
				},
				{
					parameter: "bvn",
					required: true,
					type: "String",
					description: "11 digit BVN",
					paramType: "path"
				}
			],
			description: "Match account details with BVN for verification"
		}
	],
	charge: [
		{
			api: "submit",
			endpoint: "https://api.paystack.co/charge/submit_otp",
			method: "POST",
			params: [{
				parameter: "otp",
				required: true,
				type: "String",
				description: "OTP submitted by user"
			}, {
				parameter: "reference",
				required: true,
				type: "String",
				description: "Reference for ongoing transaction"
			}],
			description: "Submit OTP to complete a charge"
		},
		{
			api: "submit",
			endpoint: "https://api.paystack.co/charge/submit_pin",
			method: "POST",
			params: [{
				parameter: "pin",
				required: true,
				type: "String",
				description: "PIN submitted by user"
			}, {
				parameter: "reference",
				required: true,
				type: "String",
				description: "Reference for transaction that requested PIN"
			}],
			description: "Submit PIN to complete a charge"
		},
		{
			api: "submit",
			endpoint: "https://api.paystack.co/charge/submit_birthday",
			method: "POST",
			params: [{
				parameter: "birthday",
				required: true,
				type: "String",
				description: "Birthday submitted by user"
			}, {
				parameter: "reference",
				required: true,
				type: "String",
				description: "Reference for ongoing transaction"
			}],
			description: "Submit birthday to complete a charge"
		},
		{
			api: "tokenize",
			endpoint: "https://api.paystack.co/charge/tokenize",
			method: "POST",
			params: [{
				parameter: "email",
				required: true,
				type: "String",
				description: "Customer email address"
			}, {
				parameter: "card",
				required: true,
				type: "String",
				description: "Card object containing number, cvv, expiry_month, and expiry_year"
			}],
			description: "Tokenize a card for future charges"
		},
		{
			api: "check",
			endpoint: "https://api.paystack.co/charge/reference",
			method: "GET",
			params: [{
				parameter: "reference",
				required: true,
				type: "String",
				description: "The reference to check"
			}],
			description: "Check the status of a charge transaction"
		},
		{
			api: "charge",
			endpoint: "https://api.paystack.co/charge",
			method: "POST",
			params: [
				{
					parameter: "email",
					required: true,
					type: "String",
					description: "Customer email address"
				},
				{
					parameter: "amount",
					required: true,
					type: "Number",
					description: "Amount in kobo"
				},
				{
					parameter: "card",
					required: false,
					type: "String",
					description: "Card object with number, cvv, expiry_month, and expiry_year"
				},
				{
					parameter: "bank",
					required: false,
					type: "String",
					description: "Bank object with code and account_number"
				},
				{
					parameter: "authorization_code",
					required: false,
					type: "String",
					description: "Valid authorization code to charge"
				},
				{
					parameter: "pin",
					required: false,
					type: "String",
					description: "4-digit PIN for non-reusable authorization code"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "A JSON object for additional transaction data"
				}
			],
			description: "Charge a customer using card, bank account, or authorization code"
		},
		{
			api: "submit",
			endpoint: "https://api.paystack.co/charge/submit_phone",
			method: "POST",
			params: [{
				parameter: "phone",
				required: true,
				type: "String",
				description: "Phone number submitted by user"
			}, {
				parameter: "reference",
				required: true,
				type: "String",
				description: "Reference for ongoing transaction"
			}],
			description: "Submit phone number to complete a charge"
		}
	],
	transaction: [
		{
			api: "verify",
			endpoint: "https://api.paystack.co/transaction/verify/{reference}",
			method: "GET",
			params: [{
				parameter: "reference",
				required: true,
				type: "String",
				description: "Transaction reference to verify",
				paramType: "path"
			}],
			description: "Verify transaction status by reference"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/transaction",
			method: "GET",
			params: [
				{
					parameter: "perPage",
					required: false,
					type: "String",
					description: "Specify how many records you want to retrieve per page"
				},
				{
					parameter: "page",
					required: false,
					type: "Number",
					description: "Specify exactly what page you want to retrieve"
				},
				{
					parameter: "customer",
					required: false,
					type: "String",
					description: "Specify an ID for the customer whose transactions you want to retrieve"
				},
				{
					parameter: "status",
					required: false,
					type: "String",
					description: "Filter transactions by status (\"failed\", \"success\", \"abandoned\")"
				},
				{
					parameter: "from",
					required: false,
					type: "String",
					description: "A timestamp from which to start listing transactions (e.g. 2016-09-24T00:00:05.000Z, 2016-09-21)"
				},
				{
					parameter: "to",
					required: false,
					type: "String",
					description: "A timestamp at which to stop listing transactions (e.g. 2016-09-24T00:00:05.000Z, 2016-09-21)"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Filter transactions by amount (in kobo)"
				}
			],
			description: "List all transactions"
		},
		{
			api: "view",
			endpoint: ":id_or_reference",
			method: "GET",
			params: [],
			description: "View a specific transaction"
		},
		{
			api: "charge",
			endpoint: "https://api.paystack.co/transaction/charge_authorization",
			method: "POST",
			params: [
				{
					parameter: "authorization_code",
					required: true,
					type: "String",
					description: "Valid authorization code to charge"
				},
				{
					parameter: "email",
					required: true,
					type: "String",
					description: "Customer email address"
				},
				{
					parameter: "amount",
					required: true,
					type: "Number",
					description: "Amount in kobo"
				},
				{
					parameter: "reference",
					required: false,
					type: "String",
					description: "Unique transaction reference"
				},
				{
					parameter: "plan",
					required: false,
					type: "String",
					description: "Plan code for subscription"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency to charge in",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional transaction metadata"
				},
				{
					parameter: "subaccount",
					required: false,
					type: "String",
					description: "Subaccount code that owns the payment"
				},
				{
					parameter: "transaction_charge",
					required: false,
					type: "String",
					description: "Flat fee to charge the subaccount in kobo"
				},
				{
					parameter: "bearer",
					required: false,
					type: "String",
					description: "Who bears Paystack charges: \"account\" or \"subaccount\""
				},
				{
					parameter: "invoice_limit",
					required: false,
					type: "String",
					description: "Number of invoices to raise during subscription"
				}
			],
			description: "Charge a customer using a stored authorization code"
		},
		{
			api: "export",
			endpoint: "https://api.paystack.co/transaction/export",
			method: "GET",
			params: [
				{
					arg: true,
					parameter: "from",
					required: false,
					type: "String",
					description: "Lower bound of date range"
				},
				{
					arg: true,
					parameter: "to",
					required: false,
					type: "String",
					description: "Upper bound of date range"
				},
				{
					parameter: "settled",
					required: false,
					type: "String",
					description: "Set to \"true\" for settled transactions or \"false\" for pending"
				},
				{
					parameter: "payment_page",
					required: false,
					type: "String",
					description: "Payment page ID to filter transactions"
				},
				{
					parameter: "customer",
					required: false,
					type: "String",
					description: "Customer ID to filter transactions"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency to filter transactions",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "settlement",
					required: false,
					type: "String",
					description: "Settlement ID to filter transactions"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Amount to filter transactions"
				},
				{
					parameter: "status",
					required: false,
					type: "String",
					description: "Status to filter transactions"
				}
			],
			description: "Export transactions to CSV"
		},
		{
			api: "check",
			endpoint: "https://api.paystack.co/transaction/check_authorization",
			method: "POST",
			params: [
				{
					parameter: "authorization_code",
					required: true,
					type: "String",
					description: "Authorization code for Mastercard or VISA"
				},
				{
					parameter: "amount",
					required: true,
					type: "Number",
					description: "Amount in kobo to check"
				},
				{
					parameter: "email",
					required: true,
					type: "String",
					description: "Customer email address"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency for the amount to check",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				}
			],
			description: "Check if an authorization code has sufficient funds"
		},
		{
			api: "transaction",
			endpoint: "https://api.paystack.co/transaction/totals",
			method: "GET",
			params: [{
				arg: true,
				parameter: "from",
				required: false,
				type: "String",
				description: "Lower bound of date range"
			}, {
				arg: true,
				parameter: "to",
				required: false,
				type: "String",
				description: "Upper bound of date range"
			}],
			description: "Get total amount received on your account"
		},
		{
			api: "initialize",
			endpoint: "https://api.paystack.co/transaction/initialize",
			method: "POST",
			params: [
				{
					parameter: "email",
					required: true,
					type: "String",
					description: "Customer email address"
				},
				{
					parameter: "amount",
					required: true,
					type: "Number",
					description: "Amount in kobo"
				},
				{
					parameter: "reference",
					required: false,
					type: "String",
					description: "Unique transaction reference or leave blank for auto-generation"
				},
				{
					parameter: "callback_url",
					required: false,
					type: "String",
					description: "URL to redirect to after payment"
				},
				{
					parameter: "plan",
					required: false,
					type: "String",
					description: "Plan code for subscription"
				},
				{
					parameter: "invoice_limit",
					required: false,
					type: "String",
					description: "Number of invoices to raise during subscription"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional transaction metadata"
				},
				{
					parameter: "subaccount",
					required: false,
					type: "String",
					description: "Subaccount code that owns the payment"
				},
				{
					parameter: "transaction_charge",
					required: false,
					type: "String",
					description: "Flat fee to charge the subaccount in kobo"
				},
				{
					parameter: "bearer",
					required: false,
					type: "String",
					description: "Who bears Paystack charges (defaults to \"account\")"
				},
				{
					parameter: "channels",
					required: false,
					type: "String",
					description: "Payment channels to enable: \"card\", \"bank\", or both as array"
				}
			],
			description: "Initialize a transaction"
		},
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/transaction/id",
			method: "GET",
			params: [{
				parameter: "id",
				required: true,
				type: "String",
				description: "An ID for the transaction to fetch"
			}],
			description: "Fetch transaction details by ID"
		}
	],
	plan: [
		{
			api: "update",
			endpoint: ":id_or_plan_code",
			method: "PUT",
			params: [
				{
					parameter: "name",
					required: false,
					type: "String",
					description: "Name of plan"
				},
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Short description of plan"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Amount to charge in kobo (will override amount for existing subscriptions)"
				},
				{
					parameter: "interval",
					required: false,
					type: "String",
					description: "Billing interval (hourly, daily, weekly, monthly, annually)"
				},
				{
					parameter: "send_invoices",
					required: false,
					type: "String",
					description: "Set to false to disable invoice emails"
				},
				{
					parameter: "send_sms",
					required: false,
					type: "String",
					description: "Set to false to disable SMS notifications"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency for the amount",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "invoice_limit",
					required: false,
					type: "String",
					description: "Number of invoices to raise during subscription (will not override active subscriptions)"
				}
			],
			description: "Update a plan"
		},
		{
			api: "create",
			endpoint: "https://api.paystack.co/plan",
			method: "POST",
			params: [
				{
					parameter: "name",
					required: true,
					type: "String",
					description: "Name of plan"
				},
				{
					parameter: "description",
					required: false,
					type: "String",
					description: "Short description of plan"
				},
				{
					parameter: "amount",
					required: true,
					type: "Number",
					description: "Amount to charge in kobo"
				},
				{
					parameter: "interval",
					required: true,
					type: "String",
					description: "Billing interval (hourly, daily, weekly, monthly, annually)"
				},
				{
					parameter: "send_invoices",
					required: false,
					type: "String",
					description: "Set to false to disable invoice emails"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Currency for the amount",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "invoice_limit",
					required: false,
					type: "String",
					description: "Number of invoices to raise during subscription"
				}
			],
			description: "Create a new plan"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/plan",
			method: "GET",
			params: [
				{
					parameter: "perPage",
					required: false,
					type: "String",
					description: "Specify how many records you want to retrieve per page"
				},
				{
					parameter: "page",
					required: false,
					type: "Number",
					description: "Specify exactly what page you want to retrieve"
				},
				{
					parameter: "interval",
					required: false,
					type: "String",
					description: "Filter list by plans with specified interval"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Filter list by plans with specified amount (in kobo)"
				}
			],
			description: "List all plans"
		},
		{
			api: "fetch",
			endpoint: "https://api.paystack.co/plan/id_or_plan_code",
			method: "GET",
			params: [],
			description: "Fetch a specific plan"
		}
	],
	customer: [
		{
			api: "update",
			endpoint: "https://api.paystack.co/customer/:ID_OR_CUSTOMER_CODE",
			method: "PUT",
			params: [
				{
					parameter: "first_name",
					required: false,
					type: "String",
					description: "Customer first name"
				},
				{
					parameter: "last_name",
					required: false,
					type: "String",
					description: "Customer last name"
				},
				{
					parameter: "phone",
					required: false,
					type: "String",
					description: "Customer phone number"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional customer information in structured JSON format"
				}
			],
			description: "Update customer details"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/customer",
			method: "GET",
			params: [{
				parameter: "perPage",
				required: false,
				type: "String",
				description: "Specify how many records you want to retrieve per page"
			}, {
				parameter: "page",
				required: false,
				type: "Number",
				description: "Specify exactly what page you want to retrieve"
			}],
			description: "List all customers"
		},
		{
			api: "create",
			endpoint: "https://api.paystack.co/customer",
			method: "POST",
			params: [
				{
					parameter: "email",
					required: true,
					type: "String",
					description: "Customer email address"
				},
				{
					parameter: "first_name",
					required: false,
					type: "String",
					description: "Customer first name"
				},
				{
					parameter: "last_name",
					required: false,
					type: "String",
					description: "Customer last name"
				},
				{
					parameter: "phone",
					required: false,
					type: "String",
					description: "Customer phone number"
				},
				{
					parameter: "metadata",
					required: false,
					type: "String",
					description: "Additional customer information in structured JSON format"
				}
			],
			description: "Create a new customer"
		},
		{
			api: "fetch",
			endpoint: ":id_or_customer_code",
			method: "GET",
			params: [{
				parameter: "exclude_transactions",
				required: false,
				type: "String",
				description: "By default, fetching a customer returns all their transactions. Set this to true to disable this behaviour"
			}],
			description: "Fetch a specific customer"
		},
		{
			api: "set_risk_action",
			endpoint: "https://api.paystack.co/customer/set_risk_action",
			method: "POST",
			params: [{
				parameter: "customer",
				required: false,
				type: "String",
				description: "Customer ID, code, or email address"
			}, {
				parameter: "risk_action",
				required: false,
				type: "String",
				description: "One of the possible risk actions. \"allow\" to whitelist, \"deny\" to blacklist"
			}],
			description: "Set customer risk action (whitelist or blacklist)"
		},
		{
			api: "deactivate",
			endpoint: "https://api.paystack.co/customer/deactivate_authorization",
			method: "POST",
			params: [{
				parameter: "authorization_code",
				required: true,
				type: "String",
				description: "Authorization code to deactivate"
			}],
			description: "Deactivate an authorization for a customer"
		}
	],
	refund: [
		{
			api: "create",
			endpoint: "https://api.paystack.co/refund",
			method: "POST",
			params: [
				{
					parameter: "transaction",
					required: true,
					type: "String",
					description: "Transaction reference or ID to refund"
				},
				{
					parameter: "amount",
					required: false,
					type: "Number",
					description: "Amount to refund in kobo (defaults to full transaction amount)"
				},
				{
					parameter: "currency",
					required: false,
					type: "String",
					description: "Three-letter ISO currency code",
					options: [
						"NGN",
						"GHS",
						"ZAR",
						"KES",
						"UGX",
						"TZS",
						"XAF",
						"XOF",
						"USD"
					]
				},
				{
					parameter: "customer_note",
					required: false,
					type: "String",
					description: "Customer-facing reason for refund"
				},
				{
					parameter: "merchant_note",
					required: false,
					type: "String",
					description: "Internal merchant reason for refund"
				}
			],
			description: "Create a refund for a transaction"
		},
		{
			api: "fetch",
			endpoint: ":id",
			method: "GET",
			params: [{
				parameter: "id",
				required: false,
				type: "String",
				description: "ID of the refund to retrieve"
			}],
			description: "Fetch refund details by ID"
		},
		{
			api: "list",
			endpoint: "https://api.paystack.co/refund",
			method: "GET",
			params: [{
				parameter: "transaction",
				required: false,
				type: "String",
				description: "Filter by transaction"
			}, {
				parameter: "currency",
				required: false,
				type: "String",
				description: "Filter by currency",
				options: [
					"NGN",
					"GHS",
					"ZAR",
					"KES",
					"UGX",
					"TZS",
					"XAF",
					"XOF",
					"USD"
				]
			}],
			description: "List all refunds"
		}
	],
	integration: [{
		api: "update",
		endpoint: "https://api.paystack.co/integration/payment_session_timeout",
		method: "PUT",
		params: [{
			parameter: "timeout",
			required: false,
			type: "String",
			description: "Session timeout in seconds (set to 0 to disable session timeouts)"
		}],
		description: "Update payment session timeout setting"
	}, {
		api: "fetch",
		endpoint: "https://api.paystack.co/integration/payment_session_timeout",
		method: "GET",
		params: [],
		description: "Fetch payment session timeout setting"
	}],
	balance: [{
		api: "check",
		endpoint: "https://api.paystack.co/balance",
		method: "GET",
		params: [],
		description: "You can only transfer from what you have"
	}, {
		api: "balance",
		endpoint: "https://api.paystack.co/balance/ledger",
		method: "GET",
		params: [],
		description: "Retrieve account balance ledger activity"
	}],
	settlement: [{
		api: "fetch",
		endpoint: "https://api.paystack.co/settlement",
		method: "GET",
		params: [
			{
				arg: true,
				parameter: "from",
				required: false,
				type: "String",
				description: "Lower bound of date range. Leave undefined to export settlement from day one"
			},
			{
				arg: true,
				parameter: "to",
				required: false,
				type: "String",
				description: "Upper bound of date range. Leave undefined to export settlements till date"
			},
			{
				parameter: "subaccount",
				required: false,
				type: "String",
				description: "Provide a subaccount code to export only settlements for that subaccount. Set to \"none\" to export only transactions for the account"
			}
		],
		description: "Retrieve settlements made to your bank accounts"
	}],
	decision: [{
		api: "resolve",
		endpoint: "{BIN)",
		method: "GET",
		params: [{
			parameter: "bin",
			required: true,
			type: "String",
			description: "First 6 characters of card"
		}],
		description: "Resolve card information by BIN"
	}],
	invoice: [{
		api: "archive",
		endpoint: ":id_or_code",
		method: "POST",
		params: [],
		description: "Archive an invoice to prevent it from being fetched or verified"
	}],
	verifications: [{
		api: "resolve",
		endpoint: "https://api.paystack.co/verifications",
		method: "POST",
		params: [
			{
				parameter: "verification_type",
				required: true,
				type: "String",
				description: "Type of verification to perform"
			},
			{
				parameter: "phone",
				required: true,
				type: "String",
				description: "Customer phone number with country code (no + prefix)"
			},
			{
				parameter: "callback_url",
				required: false,
				type: "String",
				description: "URL to receive verification details"
			}
		],
		description: "Verify customer authenticity using Truecaller API"
	}]
};
var apis_default = APIs;

//#endregion
//#region src/utils/argument.ts
/**
* We would build a command signature string from an array of arguments.
* Musket command signature for arguments follow this format:
* 
* - Optional arguments: {argumentName?}
* - Required arguments: {argumentName}
* - Optional argument with a default value: {argumentName=defaultValue}
* - Arguments with description: {argumentName : description}
* - Arguments Expecting multiple values: {argumentName*}
* 
* - Boolean flags are represented as: {--flag-name}
* - Flags expecting values are represented as: {--flag-name=}
* - Flags with description: {--flag-name : description}
* - Flags expecting multiple values: {--flag-name=*}
* - Flags with choices: {--flag-name : : choice1,choice2,choice3}
* - Or {--flag-name : description : choice1,choice2,choice3}
* 
* For shortcuts: {--F|flag-name}
* We will extract the first letter before the pipe as the shortcut, but we also 
* need to ensure it is not already used by another option, in which case we check 
* if the string is a multiword (camel, dash, underscore separated) then we try to use the first letter of the second word.
* 
* XParam properties used:
* - parameter: The name of the argument or flag.
* - required: A boolean indicating if the argument is required.
* - type: The type of the argument (String, Number, Boolean, Array, Object).
* - description: An optional description for the argument.
* - default: An optional default value for the argument.
* - options: An optional array of choices for the argument.
* 
* We will make required arguments with defaults arguments.
* Everything else would be flags.
* 
* 
* @param args 
*/
const buildSignature = (param, cmd) => {
	const [_, setShortcut] = useShortcuts();
	let signature = "";
	if ((!param.required || param.default !== void 0 || param.type === "Boolean" || param.options) && param.paramType !== "path" && param.arg !== true) {
		signature += "{--";
		if (setShortcut(cmd + ":" + param.parameter.charAt(0).toLowerCase())) signature += `${param.parameter.charAt(0).toLowerCase()}|`;
		else {
			const words = param.parameter.split(/[_-\s]/);
			if (words.length > 1) {
				if (setShortcut(cmd + ":" + words[1].charAt(0).toLowerCase())) signature += `${words[1].charAt(0).toLowerCase()}|`;
			}
		}
		signature += `${param.parameter}`;
		if (param.type !== "Boolean") signature += param.default ? `=${param.default}` : "?";
		if (param.description) signature += ` : ${param.description}`;
		if (param.options) {
			const optionsStr = param.options.join(",");
			signature += ` : ${optionsStr}`;
		}
		signature += "}";
	} else {
		signature += `{${param.parameter}`;
		if (param.default) signature += `=${param.default}`;
		if (param.description) signature += ` : ${param.description}`;
		signature += "}";
	}
	return signature;
};

//#endregion
//#region src/utils/renderer.ts
/**
* We will recursively map through the result data and log each key value pair
* as we apply coloring based on the value type.
* We also need to handle root or nested objects and arrays while considering
* indentation for better readability.
* 
* @param data 
*/
const dataRenderer = (data) => {
	const render = (obj, indent = 0) => {
		const indentation = " ".repeat(indent);
		for (const key in obj) {
			const value = obj[key];
			if (typeof value === "object" && value !== null) {
				console.log(`${indentation}${stringFormatter(key)}:`);
				render(value, indent + 2);
			} else {
				let coloredValue;
				switch (typeof value) {
					case "string":
						coloredValue = __h3ravel_shared.Logger.log(value, "green", false);
						break;
					case "number":
						coloredValue = __h3ravel_shared.Logger.log(String(value), "yellow", false);
						break;
					case "boolean":
						coloredValue = __h3ravel_shared.Logger.log(String(value), "blue", false);
						break;
					default: coloredValue = value;
				}
				console.log(`${indentation}${stringFormatter(key)}: ${coloredValue}`);
			}
		}
	};
	render(data);
};
/**
* We will format a string by replacing underscores and hyphens with spaces,
* capitalizing the first letter of every word,
* converting camelCase to spaced words,
* and trimming any leading or trailing spaces.
* If a sentence is only two letters long we will make it uppercase.
* 
* @param str 
* @returns 
*/
const stringFormatter = (str) => {
	return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\s+/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ").trim().replace(/^(\w{2})$/, (_, p1) => p1.toUpperCase());
};

//#endregion
//#region src/Commands/Commands.ts
var Commands_default = () => {
	const commands = [];
	/**
	* We should map through the APIs and reduce all apis to a single key value pair
	* where key is the API key and the schema array entry api propety separated by a 
	* semicolon and the value is schema array entry.
	*/
	const entries = Object.entries(apis_default).reduce((acc, [key, schemas]) => {
		schemas.forEach((schema) => {
			const commandKey = key === schema.api ? key : `${key}:${schema.api}`;
			acc[commandKey] = schema;
		});
		return acc;
	}, {});
	for (const [key, schema] of Object.entries(entries)) {
		const args = schema.params.map((param) => buildSignature(param, key)).join("\n");
		const command = class extends __h3ravel_musket.Command {
			signature = `${key} \n${args}`;
			description = schema.description || "No description available.";
			handle = async () => {
				const [_, setCommand] = useCommand();
				setCommand(this);
				for (const param of schema.params) if (param.required && !this.argument(param.parameter)) return void this.newLine().error(`Missing required argument: ${param.parameter}`).newLine();
				const selected_integration = read("selected_integration")?.id;
				const user = read("user")?.id;
				if (!selected_integration || !user) {
					this.error("ERROR: You're not signed in, please run the [login] command before you begin").newLine();
					return;
				}
				this.newLine();
				const spinner = (0, ora.default)("Loading...\n").start();
				const [err, result] = await promiseWrapper(executeSchema(schema, {
					...this.options(),
					...this.arguments()
				}));
				if (err || !result) return void spinner.fail((err || "An error occurred") + "\n");
				spinner.succeed(result.message);
				this.newLine();
				dataRenderer(result.data);
				this.newLine();
			};
		};
		commands.push(command);
	}
	return commands;
};

//#endregion
//#region src/utils/config.ts
const configChoices = (config) => {
	return [
		{
			name: "Debug Mode",
			value: "debug",
			description: `Enable or disable debug mode (${config.debug ? "Enabled" : "Disabled"})`
		},
		{
			name: "API Base URL",
			value: "apiBaseURL",
			description: `Set the base URL for the API (${config.apiBaseURL})`
		},
		{
			name: "Timeout Duration",
			value: "timeoutDuration",
			description: `Set the timeout duration for API requests (${config.timeoutDuration} ms)`
		},
		{
			name: "Ngrok Auth Token",
			value: "ngrokAuthToken",
			description: `Set the Ngrok Auth Token - will default to environment variable if not set (${config.ngrokAuthToken ? "************" : "Not Set"})`
		},
		{
			name: "Reset Configuration",
			value: "reset",
			description: "Reset all configurations to default values"
		}
	];
};
const saveConfig = async (choice) => {
	const [getConfig, setConfig] = useConfig();
	const [command] = useCommand();
	let config = getConfig();
	if (choice === "debug") {
		const debug = await command().confirm(`${config.debug ? "Dis" : "En"}able debug mode?`, config.debug === true);
		config.debug = config.debug !== debug;
	} else if (choice === "apiBaseURL") config.apiBaseURL = await command().ask("Enter API Base URL", config.apiBaseURL);
	else if (choice === "ngrokAuthToken") config.ngrokAuthToken = await command().ask("Enter Ngrok Auth Token", config.ngrokAuthToken || "");
	else if (choice === "timeoutDuration") {
		const timeoutDuration = await command().ask("Enter Timeout Duration (in ms)", config.timeoutDuration.toString());
		config.timeoutDuration = parseInt(timeoutDuration);
	} else if (choice === "reset") config = {
		debug: false,
		apiBaseURL: "https://api.paystack.co",
		timeoutDuration: 3e3
	};
	setConfig(config);
};

//#endregion
//#region src/Commands/ConfigCommand.ts
var ConfigCommand = class extends __h3ravel_musket.Command {
	signature = "config";
	description = "Configure paystack cli";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const [getConfig, setConfig] = useConfig();
		let config = getConfig();
		if (!config) {
			config = {
				debug: false,
				apiBaseURL: "https://api.paystack.co",
				timeoutDuration: 3e3
			};
			setConfig(config);
		}
		await saveConfig(await this.choice("Select configuration to set", configChoices(config)));
		this.info("Configuration updated successfully!").newLine();
	}
};

//#endregion
//#region src/Commands/InitCommand.ts
var InitCommand = class extends __h3ravel_musket.Command {
	signature = "init";
	description = "Initialize the application.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		init();
		this.info("Application initialized successfully.").newLine();
	}
};

//#endregion
//#region src/paystack/webhooks.ts
const webhook = {
	"charge.success": {
		event: "charge.success",
		data: {
			id: 302961,
			domain: "live",
			status: "success",
			reference: "qTPrJoy9Bx",
			amount: 1e4,
			message: null,
			gateway_response: "Approved by Financial Institution",
			paid_at: "2016-09-30T21:10:19.000Z",
			created_at: "2016-09-30T21:09:56.000Z",
			channel: "card",
			currency: "NGN",
			ip_address: "41.242.49.37",
			metadata: 0,
			log: {
				time_spent: 16,
				attempts: 1,
				authentication: "pin",
				errors: 0,
				success: false,
				mobile: false,
				input: [],
				channel: null,
				history: [
					{
						type: "input",
						message: "Filled these fields: card number, card expiry, card cvv",
						time: 15
					},
					{
						type: "action",
						message: "Attempted to pay",
						time: 15
					},
					{
						type: "auth",
						message: "Authentication Required: pin",
						time: 16
					}
				]
			},
			fees: null,
			customer: {
				id: 68324,
				first_name: "BoJack",
				last_name: "Horseman",
				email: "bojack@horseman.com",
				customer_code: "CUS_qo38as2hpsgk2r0",
				phone: null,
				metadata: null,
				risk_action: "default"
			},
			authorization: {
				authorization_code: "AUTH_f5rnfq9p",
				bin: "539999",
				last4: "8877",
				exp_month: "08",
				exp_year: "2020",
				card_type: "mastercard DEBIT",
				bank: "Guaranty Trust Bank",
				country_code: "NG",
				brand: "mastercard"
			},
			plan: {}
		}
	},
	"transfer.success": {
		event: "transfer.success",
		data: {
			domain: "live",
			amount: 1e4,
			currency: "NGN",
			source: "balance",
			source_details: null,
			reason: "Bless you",
			recipient: {
				domain: "live",
				type: "nuban",
				currency: "NGN",
				name: "Someone",
				details: {
					account_number: "0123456789",
					account_name: null,
					bank_code: "058",
					bank_name: "Guaranty Trust Bank"
				},
				description: null,
				metadata: null,
				recipient_code: "RCP_xoosxcjojnvronx",
				active: true
			},
			status: "success",
			transfer_code: "TRF_zy6w214r4aw9971",
			transferred_at: "2017-03-25T17:51:24.000Z",
			created_at: "2017-03-25T17:48:54.000Z"
		}
	},
	"subscription.create": {
		event: "subscription.create",
		data: {
			domain: "test",
			status: "active",
			subscription_code: "SUB_vsyqdmlzble3uii",
			amount: 5e4,
			cron_expression: "0 0 28 * *",
			next_payment_date: "2016-05-19T07:00:00.000Z",
			open_invoice: null,
			createdAt: "2016-03-20T00:23:24.000Z",
			plan: {
				name: "Monthly retainer",
				plan_code: "PLN_gx2wn530m0i3w3m",
				description: null,
				amount: 5e4,
				interval: "monthly",
				send_invoices: true,
				send_sms: true,
				currency: "NGN"
			},
			authorization: {
				authorization_code: "AUTH_96xphygz",
				bin: "539983",
				last4: "7357",
				exp_month: "10",
				exp_year: "2017",
				card_type: "MASTERCARD DEBIT",
				bank: "GTBANK",
				country_code: "NG",
				brand: "MASTERCARD"
			},
			customer: {
				first_name: "BoJack",
				last_name: "Horseman",
				email: "bojack@horsinaround.com",
				customer_code: "CUS_xnxdt6s1zg1f4nx",
				phone: "",
				metadata: {},
				risk_action: "default"
			},
			created_at: "2016-10-01T10:59:59.000Z"
		}
	},
	"transfer.failed": {
		event: "transfer.failed",
		data: {
			domain: "test",
			amount: 1e4,
			currency: "NGN",
			source: "balance",
			source_details: null,
			reason: "Test",
			recipient: {
				domain: "live",
				type: "nuban",
				currency: "NGN",
				name: "Test account",
				details: {
					account_number: "0000000000",
					account_name: null,
					bank_code: "058",
					bank_name: "Zenith Bank"
				},
				description: null,
				metadata: null,
				recipient_code: "RCP_7um8q67gj0v4n1c",
				active: true
			},
			status: "failed",
			transfer_code: "TRF_3g8pc1cfmn00x6u",
			transferred_at: null,
			created_at: "2017-12-01T08:51:37.000Z"
		}
	}
};
var webhooks_default = webhook;

//#endregion
//#region src/Paystack.ts
/**
* Select an integration
* 
* @param integrations 
* @param token 
* @returns 
*/
async function selectIntegration(integrations, token) {
	const [command] = useCommand();
	const id = await command().choice("Choose an integration", integrations.map((e) => {
		return {
			value: e.id?.toString() || "",
			name: e.business_name || ""
		};
	}));
	return new Promise((resolve, reject) => {
		const integration = integrations.find((i) => i.id?.toString() === id);
		if (!integration) {
			reject("Invalid integration selected");
			return;
		}
		axios_default.post("/user/switch_integration", { integration: integration.id }, { headers: {
			Authorization: "Bearer " + token,
			"jwt-auth": true
		} }).then(() => {
			resolve(integration);
		}).catch((err) => {
			command().error("ERROR: " + err.response.data);
			reject(err);
		});
	});
}
/**
* Refresh integration data
* 
* @returns 
*/
async function refreshIntegration() {
	const [command] = useCommand();
	let token = "";
	const user_role = read("selected_integration").logged_in_user_role;
	const integration = read("selected_integration");
	if (parseInt(read("token_expiry")) * 1e3 > parseFloat(Date.now().toString())) {
		token = read("token");
		return true;
	} else {
		const password = await command().secret("What's your password: (" + read("user").email + ") \n>");
		const [err$1, result] = await promiseWrapper(signIn(read("user").email, password));
		if (err$1 || !result) return false;
		token = result.data.token;
	}
	const [err, integrationData] = await promiseWrapper(getIntegration(integration.id, token));
	if (err) {
		command().error("ERROR: " + err);
		return false;
	}
	if (integrationData) integrationData.logged_in_user_role = user_role;
	write("selected_integration", integrationData);
}
/**
* Set webhook URL for an integration
* 
* @param url 
* @param token 
* @param integrationId 
* @param domain 
* @returns 
*/
function setWebhook(url$1, token, integrationId, domain = "test") {
	return new Promise((resolve, reject) => {
		const data = {
			[domain + "_webhook_endpoint"]: url$1,
			integration: integrationId
		};
		axios_default.put("/integration/webhooks", data, { headers: {
			Authorization: "Bearer " + token,
			"jwt-auth": true
		} }).then((resp) => {
			const integration = read("selected_integration");
			write("selected_integration", {
				...integration,
				[domain + "_webhook_endpoint"]: url$1
			});
			resolve(resp.data.message);
		}).catch((err) => {
			reject(err);
		});
	});
}
/**
* Get integration keys
* 
* @param token 
* @param type 
* @param domain 
* @returns 
*/
function getKeys(token, type = "secret", domain = "test") {
	return new Promise((resolve, reject) => {
		axios_default.get("/integration/keys", { headers: {
			Authorization: "Bearer " + token,
			"jwt-auth": true
		} }).then((response) => {
			let key = {};
			const keys = response.data.data;
			if (keys.length) {
				for (let i = 0; i < keys.length; i++) if (keys[i].domain === domain && keys[i].type === type) {
					key = keys[i];
					break;
				}
			}
			resolve(key.key);
		}).catch((error) => {
			if (error.response) {
				reject(error.response.data.message);
				return;
			}
			reject(error);
		});
	});
}
/**
* Ping webhook URL
* 
* @param options 
* @param event 
* @returns 
*/
async function pingWebhook(options, event = "charge.success") {
	const [command] = useCommand();
	let canProceed = false;
	try {
		canProceed = await refreshIntegration();
	} catch (e) {
		console.error(e);
	}
	let domain = "test";
	if (options.domain) domain = options.domain;
	if (options.event) event = options.event;
	const key = await getKeys(read("token"), "secret", domain);
	return new Promise((resolve, reject) => {
		if (!canProceed) return void command().error("ERROR: Unable to ping webhook URL");
		const eventObject = webhooks_default[event];
		if (eventObject) {
			const hash = crypto.default.createHmac("sha512", key).update(JSON.stringify(eventObject)).digest("hex");
			const uri = read("selected_integration")[domain + "_webhook_endpoint"];
			const spinner = (0, ora.default)(`Sending sample ${event} event payload to ${uri}`).start();
			axios_default.post(uri, eventObject, { headers: { "x-paystack-signature": hash } }).then((response) => {
				spinner.succeed(`Sample ${event} event payload sent to ${uri}`);
				resolve({
					code: response.status,
					text: response.statusText,
					data: response.data
				});
			}).catch((e) => {
				spinner.fail(`Failed to send sample ${event} event payload to ${uri}`);
				resolve({
					code: e.response?.status ?? 0,
					text: e.response?.statusText || "No response",
					data: typeof e.response?.data === "string" && e.response?.data?.includes("<html") ? { response: "HTML Response" } : e.response?.data || "No response data"
				});
			});
		} else {
			command().error("ERROR: Invalid event type - " + event);
			reject();
		}
	});
}
/**
* Get integration
* 
* @param id 
* @param token 
* @returns 
*/
function getIntegration(id, token) {
	const [command] = useCommand();
	const spinner = (0, ora.default)("getting integration").start();
	return new Promise((resolve, reject) => {
		axios_default.get("/integration/" + id, { headers: {
			Authorization: "Bearer " + token,
			"jwt-auth": true
		} }).then((response) => {
			resolve(response.data.data);
		}).catch((e) => {
			command().error(`ERROR: ${e}`);
			reject(e.response.data.message);
		}).finally(() => {
			spinner.stop();
		});
	});
}
/**
* Sign in user
* 
* @param email 
* @param password 
* @returns 
*/
async function signIn(email, password) {
	const [command] = useCommand();
	const spinner = (0, ora.default)("Logging in...").start();
	try {
		const { data: response } = await axios_default.post("/login", {
			email,
			password
		});
		if (response && response.data && !response.data.mfa_required) {
			spinner.succeed("Login successful");
			return response;
		} else if (response && response.data && response.data.mfa_required) {
			spinner.stop();
			const totp = await command().secret("Enter OTP or MFA code:", "*");
			spinner.start("Verifying MFA...");
			const [e, payload] = await promiseWrapper(verifyMfa(totp, response.data.token));
			if (payload && !e) {
				spinner.succeed("Login successful");
				return payload;
			} else spinner.fail(e ?? "MFA verification failed");
		} else spinner.fail("Login failed");
	} catch (e) {
		spinner.fail(e.response?.data?.message?.text || e.response?.data?.message || "Unable to sign in, please try again in a few minutes");
	}
}
/**
* Verify MFA
* 
* @param totp 
* @param token 
* @returns 
*/
function verifyMfa(totp, token) {
	return new Promise((resolve, reject) => {
		axios_default.post("/verify-mfa", { totp }, { headers: {
			Authorization: `Bearer ${token}`,
			"jwt-auth": true
		} }).then((response) => {
			resolve(response.data);
		}).catch(({ response }) => {
			reject(response.data.message || "Unable to verify MFA, please try again in a few minutes");
		});
	});
}
/**
* Store login details
* 
* @param payload 
*/
function storeLoginDetails(payload) {
	write("token", payload.data.token);
	write("token_expiry", payload.data.expiry);
	write("user", payload.data.user);
}
/**
* Clear authentication details
*/
function clearAuth() {
	remove("token");
	remove("token_expiry");
	remove("user");
}

//#endregion
//#region src/Commands/LoginCommand.ts
var LoginCommand = class extends __h3ravel_musket.Command {
	signature = "login";
	description = "Log in to paystack cli";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		let token, user;
		if (parseInt(read("token_expiry")) * 1e3 > parseFloat(Date.now().toString())) {
			token = read("token");
			user = read("user");
			this.info("You're already logged in");
			return;
		} else {
			const remembered = read("remember_login");
			const email = await this.ask("Email address", remembered ? remembered.email : void 0);
			const password = await this.secret("Password", "*");
			if (await this.confirm("Remember Email Address?", true)) write("remember_login", { email });
			else remove("remember_login");
			const [_$1, response] = await promiseWrapper(signIn(email, password));
			if (response && response.data) {
				storeLoginDetails(response);
				token = response.data.token;
				user = response.data.user;
			}
		}
		if (token && user) {
			const [err, integration] = await promiseWrapper(selectIntegration(user.integrations, token));
			if (err || !integration) this.error("ERROR: " + (err ?? "Integration selection failed")).newLine();
			else {
				write("selected_integration", integration);
				const user_role = read("selected_integration").logged_in_user_role;
				const [err$1, integrationData] = await promiseWrapper(getIntegration(integration.id, token));
				if (err$1 || !integrationData) return void this.error("ERROR: " + (err$1 ?? "Failed to fetch integration data")).newLine();
				integrationData.logged_in_user_role = user_role;
				write("selected_integration", integrationData);
				__h3ravel_shared.Logger.log([
					["Logged in as", "white"],
					[user.email, "cyan"],
					["-", "white"],
					[integration.business_name, "green"],
					["(" + integration.id + ")", "white"]
				], " ");
				this.newLine();
			}
		}
	}
};

//#endregion
//#region src/Commands/LogoutCommand.ts
var LogoutCommand = class extends __h3ravel_musket.Command {
	signature = "logout";
	description = "Log out of paystack cli";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		this.newLine();
		const spinner = (0, ora.default)("Logging out...").start();
		try {
			await wait(1e3, () => clearAuth());
			spinner.succeed("Logged out successfully");
		} catch (error) {
			spinner.fail("Logout failed");
			console.error("An error occurred during logout:", error);
		}
		this.newLine();
	}
};

//#endregion
//#region src/Commands/WebhookCommand.ts
var WebhookCommand = class extends __h3ravel_musket.Command {
	signature = `webhook
    {command=listen : The command to run to listen for webhooks locally : [listen, ping]}
    {local_route? : Specify the local route to listen on for webhooks (only for listen command)}
    {--D|domain=test : Specify the domain to ping the webhook : [test, live]}
    {--F|forward? : Specify a URL to forward the webhook to instead of the saved webhook URL}
    {--E|event? : Specify the event type to simulate : [charge.success,transfer.success,transfer.failed,subscription.create]}
`;
	description = "Listen for webhook events locally, runs a webhook endpoint health check and listens for incoming webhooks, and ping your webhook URL from the CLI.";
	async handle() {
		const [_, setCommand] = useCommand();
		const [getConfig] = useConfig();
		setCommand(this);
		this.newLine();
		const config = getConfig();
		let event = this.option("event");
		let local_route = this.argument("local_route");
		const selected_integration = read("selected_integration")?.id;
		const user = read("user")?.id;
		if (!selected_integration || !user) return void this.error("ERROR: You're not signed in, please run the `login` command before you begin");
		if (this.argument("command") == "listen" && !local_route) local_route = await this.ask("Enter the local route to listen on for webhooks: ", "http://localhost:8080/webhook");
		else if (this.argument("command") == "ping" && !event) event = await this.choice("Select event to simulate", [
			{
				name: "Charge Success",
				value: "charge.success"
			},
			{
				name: "Transfer Success",
				value: "transfer.success"
			},
			{
				name: "Transfer Failed",
				value: "transfer.failed"
			},
			{
				name: "Subscription Create",
				value: "subscription.create"
			}
		], 0);
		const domain = this.option("domain", "test");
		const forward = this.option("forward") || null;
		if (this.argument("command") == "listen") {
			const token = read("token");
			if (parseInt(read("token_expiry")) * 1e3 < parseFloat(Date.now().toString())) {
				this.error("ERROR: Your session has expired. Please run the `login` command to sign in again.");
				return;
			}
			const url$1 = parseURL(local_route);
			if (!url$1.port) url$1.port = "8000";
			if (!url$1.search || url$1.search == "?") url$1.search = "";
			try {
				await __ngrok_ngrok.default.kill();
			} catch {
				this.debug("No existing ngrok process found to kill.");
			}
			const ngrokURL = (await __ngrok_ngrok.default.forward({
				addr: url$1.port,
				authtoken: config.ngrokAuthToken || process.env.NGROK_AUTH_TOKEN,
				domain: process.env.NGROK_DOMAIN
			})).url();
			const domain$1 = this.option("domain", "test");
			const spinner = (0, ora.default)("Tunelling webhook events to " + logger(local_route)).start();
			const [err, result] = await promiseWrapper(setWebhook(ngrokURL, token, read("selected_integration").id));
			if (err || !result) return void this.error("ERROR: " + (err ?? "Failed to set webhook URL")).newLine();
			spinner.succeed("Listening for incoming webhook events at " + logger(local_route));
			this.newLine().success(`INFO: Press ${logger("Ctrl+C", ["grey", "italic"])} to stop listening for webhook events.`).success(`INFO: Webhook URL set to ${logger(ngrokURL)} for ${domain$1} domain`).newLine();
			process.stdin.resume();
		} else if (this.argument("command") == "ping") {
			await promiseWrapper(refreshIntegration());
			const [e, response] = await promiseWrapper(pingWebhook({
				...this.options(),
				domain,
				forward
			}, event));
			if (e || !response) return void this.error("ERROR: " + (e ?? "Failed to ping webhook URL.")).newLine();
			this.newLine().info(response.code + " - " + response.text).newLine();
			if (isJson(response.data)) dataRenderer(response.data);
			else dataRenderer({ body: response.data });
		} else this.error("ERROR: Invalid command. Please use either \"listen\" or \"ping\".").newLine();
	}
};

//#endregion
//#region src/logo.ts
var logo_default = `
▄▖      ▗     ▌   ▄▖▖ ▄▖
▙▌▀▌▌▌▛▘▜▘▀▌▛▘▙▘  ▌ ▌ ▐ 
▌ █▌▙▌▄▌▐▖█▌▙▖▛▖  ▙▖▙▖▟▖
    ▄▌                                                                                        
`;

//#endregion
//#region src/cli.ts
var Application = class {};
initAxios();
__h3ravel_musket.Kernel.init(new Application(), {
	logo: logo_default,
	exceptionHandler(exception) {
		const [getConfig] = useConfig();
		const config = getConfig();
		console.error(config.debug ? exception : exception.message);
	},
	baseCommands: [
		InitCommand,
		LoginCommand,
		LogoutCommand,
		ConfigCommand,
		WebhookCommand,
		...Commands_default()
	]
});

//#endregion