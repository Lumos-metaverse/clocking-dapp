export const CLOCKING_CONTRACT_ADDRESS = "0xbA6e602e914C18dd2E15B9E771b942f7718cba83";

export const CLOCKING_CONTRACT_ABI = [
	{
		"inputs": [],
		"name": "clockIn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_attendanceIndex",
				"type": "uint256"
			}
		],
		"name": "clockOut",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_staffAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_staffName",
				"type": "string"
			}
		],
		"name": "registerStaff",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_month",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_noOfDays",
				"type": "uint256"
			}
		],
		"name": "setupClockingPeriod",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_staffAddress",
				"type": "address"
			}
		],
		"name": "getStaffAttendance",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "month",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "signIn",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "signOut",
						"type": "uint256"
					}
				],
				"internalType": "struct Clocking.Attendance[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_staffAddress",
				"type": "address"
			}
		],
		"name": "getStaffName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];