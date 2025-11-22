// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AnonymousIncidentReporting
 * @dev Smart contract for anonymous incident reporting for forest conservation
 * @notice This contract allows users to report incidents anonymously using blockchain
 */
contract AnonymousIncidentReporting is Ownable, ReentrancyGuard {
    
    // Incident types
    enum IncidentType {
        ILLEGAL_LOGGING,
        WILDFIRE,
        POACHING,
        DEFORESTATION,
        POLLUTION,
        TREE_DISEASE,
        OTHER
    }
    
    // Severity levels
    enum SeverityLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
    
    // Report status
    enum ReportStatus {
        PENDING,
        INVESTIGATING,
        VERIFIED,
        RESOLVED,
        DISMISSED
    }
    
    // Incident Report Structure
    struct IncidentReport {
        bytes32 reportHash;           // Hash of report details for anonymity
        IncidentType incidentType;
        SeverityLevel severity;
        ReportStatus status;
        uint256 timestamp;
        int256 latitude;              // Stored as integer (multiply by 1e6)
        int256 longitude;             // Stored as integer (multiply by 1e6)
        string locationDescription;
        bytes32 evidenceHash;         // IPFS hash or evidence hash
        address reporter;             // Can be anonymous address
        uint256 verificationCount;
        bool isAnonymous;
        uint256 rewardAmount;
    }
    
    // Verification structure for community validation
    struct Verification {
        address verifier;
        bool isValid;
        string comment;
        uint256 timestamp;
    }
    
    // State variables
    uint256 public reportCount;
    mapping(uint256 => IncidentReport) public reports;
    mapping(uint256 => Verification[]) public reportVerifications;
    mapping(address => uint256[]) public userReports;
    mapping(bytes32 => bool) public reportExists;
    
    // Reward pool for verified reports
    uint256 public rewardPool;
    uint256 public constant MIN_VERIFICATIONS = 3;
    uint256 public constant REWARD_AMOUNT = 0.01 ether;
    
    // Authorized rangers/validators
    mapping(address => bool) public authorizedRangers;
    
    // Events
    event IncidentReported(
        uint256 indexed reportId,
        bytes32 indexed reportHash,
        IncidentType incidentType,
        SeverityLevel severity,
        bool isAnonymous,
        uint256 timestamp
    );
    
    event ReportVerified(
        uint256 indexed reportId,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );
    
    event ReportStatusUpdated(
        uint256 indexed reportId,
        ReportStatus oldStatus,
        ReportStatus newStatus,
        uint256 timestamp
    );
    
    event RewardClaimed(
        uint256 indexed reportId,
        address indexed reporter,
        uint256 amount
    );
    
    event RangerAuthorized(address indexed ranger);
    event RangerRevoked(address indexed ranger);
    
    // Modifiers
    modifier onlyRanger() {
        require(authorizedRangers[msg.sender] || msg.sender == owner(), "Not authorized ranger");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        reportCount = 0;
    }
    
    /**
     * @dev Submit an anonymous incident report
     * @param _reportHash Hash of the encrypted report details
     * @param _incidentType Type of incident being reported
     * @param _severity Severity level of the incident
     * @param _latitude Latitude coordinate (multiplied by 1e6)
     * @param _longitude Longitude coordinate (multiplied by 1e6)
     * @param _locationDescription Description of the location
     * @param _evidenceHash Hash of evidence (e.g., IPFS hash)
     * @param _isAnonymous Whether the report should be anonymous
     */
    function submitReport(
        bytes32 _reportHash,
        IncidentType _incidentType,
        SeverityLevel _severity,
        int256 _latitude,
        int256 _longitude,
        string memory _locationDescription,
        bytes32 _evidenceHash,
        bool _isAnonymous
    ) external nonReentrant returns (uint256) {
        require(!reportExists[_reportHash], "Report already exists");
        require(_latitude >= -90000000 && _latitude <= 90000000, "Invalid latitude");
        require(_longitude >= -180000000 && _longitude <= 180000000, "Invalid longitude");
        
        reportCount++;
        uint256 reportId = reportCount;
        
        reports[reportId] = IncidentReport({
            reportHash: _reportHash,
            incidentType: _incidentType,
            severity: _severity,
            status: ReportStatus.PENDING,
            timestamp: block.timestamp,
            latitude: _latitude,
            longitude: _longitude,
            locationDescription: _locationDescription,
            evidenceHash: _evidenceHash,
            reporter: _isAnonymous ? address(0) : msg.sender,
            verificationCount: 0,
            isAnonymous: _isAnonymous,
            rewardAmount: 0
        });
        
        reportExists[_reportHash] = true;
        
        if (!_isAnonymous) {
            userReports[msg.sender].push(reportId);
        }
        
        emit IncidentReported(
            reportId,
            _reportHash,
            _incidentType,
            _severity,
            _isAnonymous,
            block.timestamp
        );
        
        return reportId;
    }
    
    /**
     * @dev Verify a report (rangers or authorized validators)
     * @param _reportId ID of the report to verify
     * @param _isValid Whether the report is valid
     * @param _comment Verification comment
     */
    function verifyReport(
        uint256 _reportId,
        bool _isValid,
        string memory _comment
    ) external onlyRanger {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        require(reports[_reportId].status == ReportStatus.PENDING, "Report already processed");
        
        reportVerifications[_reportId].push(Verification({
            verifier: msg.sender,
            isValid: _isValid,
            comment: _comment,
            timestamp: block.timestamp
        }));
        
        reports[_reportId].verificationCount++;
        
        emit ReportVerified(_reportId, msg.sender, _isValid, block.timestamp);
        
        // Auto-update status if minimum verifications reached
        if (reports[_reportId].verificationCount >= MIN_VERIFICATIONS) {
            uint256 validCount = 0;
            for (uint256 i = 0; i < reportVerifications[_reportId].length; i++) {
                if (reportVerifications[_reportId][i].isValid) {
                    validCount++;
                }
            }
            
            if (validCount >= MIN_VERIFICATIONS) {
                _updateReportStatus(_reportId, ReportStatus.VERIFIED);
                reports[_reportId].rewardAmount = REWARD_AMOUNT;
            }
        }
    }
    
    /**
     * @dev Update report status (rangers only)
     * @param _reportId ID of the report
     * @param _newStatus New status
     */
    function updateReportStatus(
        uint256 _reportId,
        ReportStatus _newStatus
    ) external onlyRanger {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        _updateReportStatus(_reportId, _newStatus);
    }
    
    /**
     * @dev Internal function to update report status
     */
    function _updateReportStatus(uint256 _reportId, ReportStatus _newStatus) internal {
        ReportStatus oldStatus = reports[_reportId].status;
        reports[_reportId].status = _newStatus;
        
        emit ReportStatusUpdated(_reportId, oldStatus, _newStatus, block.timestamp);
    }
    
    /**
     * @dev Claim reward for verified report
     * @param _reportId ID of the report
     * @param _reporterAddress Address to send reward (for anonymous reports, must provide proof)
     */
    function claimReward(uint256 _reportId, address _reporterAddress) external nonReentrant {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        IncidentReport storage report = reports[_reportId];
        
        require(report.status == ReportStatus.VERIFIED, "Report not verified");
        require(report.rewardAmount > 0, "No reward available");
        
        // For non-anonymous reports, only the reporter can claim
        if (!report.isAnonymous) {
            require(msg.sender == report.reporter, "Not the reporter");
        } else {
            // For anonymous reports, allow claiming with provided address
            require(_reporterAddress != address(0), "Invalid address");
        }
        
        uint256 reward = report.rewardAmount;
        report.rewardAmount = 0;
        
        (bool success, ) = payable(_reporterAddress).call{value: reward}("");
        require(success, "Reward transfer failed");
        
        emit RewardClaimed(_reportId, _reporterAddress, reward);
    }
    
    /**
     * @dev Get report details
     * @param _reportId ID of the report
     */
    function getReport(uint256 _reportId) external view returns (
        bytes32 reportHash,
        IncidentType incidentType,
        SeverityLevel severity,
        ReportStatus status,
        uint256 timestamp,
        int256 latitude,
        int256 longitude,
        string memory locationDescription,
        bytes32 evidenceHash,
        bool isAnonymous,
        uint256 verificationCount,
        uint256 rewardAmount
    ) {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        IncidentReport memory report = reports[_reportId];
        
        return (
            report.reportHash,
            report.incidentType,
            report.severity,
            report.status,
            report.timestamp,
            report.latitude,
            report.longitude,
            report.locationDescription,
            report.evidenceHash,
            report.isAnonymous,
            report.verificationCount,
            report.rewardAmount
        );
    }
    
    /**
     * @dev Get all verifications for a report
     * @param _reportId ID of the report
     */
    function getReportVerifications(uint256 _reportId) external view returns (Verification[] memory) {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        return reportVerifications[_reportId];
    }
    
    /**
     * @dev Get user's reports (non-anonymous only)
     * @param _user User address
     */
    function getUserReports(address _user) external view returns (uint256[] memory) {
        return userReports[_user];
    }
    
    /**
     * @dev Authorize a ranger
     * @param _ranger Address to authorize
     */
    function authorizeRanger(address _ranger) external onlyOwner {
        authorizedRangers[_ranger] = true;
        emit RangerAuthorized(_ranger);
    }
    
    /**
     * @dev Revoke ranger authorization
     * @param _ranger Address to revoke
     */
    function revokeRanger(address _ranger) external onlyOwner {
        authorizedRangers[_ranger] = false;
        emit RangerRevoked(_ranger);
    }
    
    /**
     * @dev Add funds to reward pool
     */
    function addRewardPool() external payable {
        rewardPool += msg.value;
    }
    
    /**
     * @dev Withdraw funds (owner only)
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Receive function to accept Ether
    receive() external payable {
        rewardPool += msg.value;
    }
}
