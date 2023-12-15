// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Clocking {
    struct Staff {
        string name;
        uint256 employmentTimestamp;
    }

    struct Attendance {
        string month;
        uint256 signIn;
        uint256 signOut;
    }

    string month;
    uint256 duration; // in days
    address public owner;

    mapping(address => Staff) registeredStaff;
    mapping(address => Attendance[]) staffAttendance;

    constructor() {
        owner = msg.sender;
    }

    function registerStaff(address _staffAddress, string memory _staffName) external {
        onlyOwner();

        Staff storage newStaff = registeredStaff[_staffAddress];
        require(_staffAddress != address(0), "staff can't be zero address");
        require(newStaff.employmentTimestamp == 0, "this staff is already employed");

        newStaff.name = _staffName;
        newStaff.employmentTimestamp = block.timestamp;
    }

    function setupClockingPeriod(string memory _month, uint256 _noOfDays) external {
        onlyOwner();

        require(_noOfDays > 0, "attendance days can't be zero");

        month = _month;
        duration = block.timestamp + (_noOfDays * 1 days);
    }

    function clockIn() external {
        Staff memory activeStaff = registeredStaff[msg.sender];

        require(activeStaff.employmentTimestamp > 0, "you are not a registered staff");
        require(duration > block.timestamp, "clocking period elapsed");

        staffAttendance[msg.sender].push(Attendance({
            month: month,
            signIn: block.timestamp,
            signOut: 0
        }));
    }

    function clockOut(uint256 _attendanceIndex) external {
        Staff memory activeStaff = registeredStaff[msg.sender];

        require(activeStaff.employmentTimestamp > 0, "you are not a registered staff");
        require(duration > block.timestamp, "clocking period elapsed");
        require(_attendanceIndex <= staffAttendance[msg.sender].length - 1, "invalid attendance index");

        staffAttendance[msg.sender][_attendanceIndex].signOut = block.timestamp;
    }

    function getStaffAttendance(address _staffAddress) external view returns (Attendance[] memory) {
        return staffAttendance[_staffAddress];
    }

    function getStaffName(address _staffAddress) external view returns (string memory) {
        return registeredStaff[_staffAddress].name;
    }

    function onlyOwner() private view {
        require(msg.sender == owner, "you are not owner");
    }
}