const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnonymousIncidentReporting", function () {
  let contract;
  let owner;
  let ranger1;
  let ranger2;
  let reporter1;
  let reporter2;

  // Enum values
  const IncidentType = {
    ILLEGAL_LOGGING: 0,
    WILDFIRE: 1,
    POACHING: 2,
    DEFORESTATION: 3,
    POLLUTION: 4,
    TREE_DISEASE: 5,
    OTHER: 6
  };

  const SeverityLevel = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    CRITICAL: 3
  };

  const ReportStatus = {
    PENDING: 0,
    INVESTIGATING: 1,
    VERIFIED: 2,
    RESOLVED: 3,
    DISMISSED: 4
  };

  beforeEach(async function () {
    [owner, ranger1, ranger2, reporter1, reporter2] = await ethers.getSigners();
    
    const AnonymousIncidentReporting = await ethers.getContractFactory("AnonymousIncidentReporting");
    contract = await AnonymousIncidentReporting.deploy();
    await contract.waitForDeployment();
    
    // Authorize rangers
    await contract.authorizeRanger(ranger1.address);
    await contract.authorizeRanger(ranger2.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero reports", async function () {
      expect(await contract.reportCount()).to.equal(0);
    });
  });

  describe("Report Submission", function () {
    it("Should submit an anonymous report", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Anonymous Report 1"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence IPFS Hash"));
      
      await expect(
        contract.connect(reporter1).submitReport(
          reportHash,
          IncidentType.ILLEGAL_LOGGING,
          SeverityLevel.HIGH,
          -1270000, // Latitude (Kenya, -1.27 * 1e6)
          36820000, // Longitude (Kenya, 36.82 * 1e6)
          "Near Karura Forest",
          evidenceHash,
          true // isAnonymous
        )
      ).to.emit(contract, "IncidentReported")
        .withArgs(1, reportHash, IncidentType.ILLEGAL_LOGGING, SeverityLevel.HIGH, true, await ethers.provider.getBlock('latest').then(b => b.timestamp));
      
      expect(await contract.reportCount()).to.equal(1);
    });

    it("Should submit a non-anonymous report", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Report 2"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence 2"));
      
      await contract.connect(reporter1).submitReport(
        reportHash,
        IncidentType.WILDFIRE,
        SeverityLevel.CRITICAL,
        -1300000,
        36900000,
        "Aberdare Forest",
        evidenceHash,
        false // not anonymous
      );
      
      const report = await contract.getReport(1);
      expect(report.isAnonymous).to.equal(false);
    });

    it("Should reject duplicate reports", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Report"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await contract.connect(reporter1).submitReport(
        reportHash,
        IncidentType.ILLEGAL_LOGGING,
        SeverityLevel.HIGH,
        -1270000,
        36820000,
        "Location",
        evidenceHash,
        true
      );
      
      await expect(
        contract.connect(reporter2).submitReport(
          reportHash, // Same hash
          IncidentType.WILDFIRE,
          SeverityLevel.MEDIUM,
          -1280000,
          36830000,
          "Different Location",
          evidenceHash,
          true
        )
      ).to.be.revertedWith("Report already exists");
    });

    it("Should reject invalid coordinates", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Report"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await expect(
        contract.connect(reporter1).submitReport(
          reportHash,
          IncidentType.ILLEGAL_LOGGING,
          SeverityLevel.HIGH,
          91000000, // Invalid latitude > 90
          36820000,
          "Location",
          evidenceHash,
          true
        )
      ).to.be.revertedWith("Invalid latitude");
    });
  });

  describe("Report Verification", function () {
    beforeEach(async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Test Report"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Test Evidence"));
      
      await contract.connect(reporter1).submitReport(
        reportHash,
        IncidentType.ILLEGAL_LOGGING,
        SeverityLevel.HIGH,
        -1270000,
        36820000,
        "Test Location",
        evidenceHash,
        true
      );
    });

    it("Should allow rangers to verify reports", async function () {
      await expect(
        contract.connect(ranger1).verifyReport(1, true, "Verified by ranger")
      ).to.emit(contract, "ReportVerified")
        .withArgs(1, ranger1.address, true, await ethers.provider.getBlock('latest').then(b => b.timestamp));
    });

    it("Should reject verification from non-rangers", async function () {
      await expect(
        contract.connect(reporter1).verifyReport(1, true, "Trying to verify")
      ).to.be.revertedWith("Not authorized ranger");
    });

    it("Should auto-verify report after minimum verifications", async function () {
      // Add reward pool
      await contract.addRewardPool({ value: ethers.parseEther("1.0") });
      
      // Get 3 rangers to verify
      await contract.connect(ranger1).verifyReport(1, true, "Ranger 1 verified");
      await contract.connect(ranger2).verifyReport(1, true, "Ranger 2 verified");
      await contract.connect(owner).verifyReport(1, true, "Owner verified");
      
      const report = await contract.getReport(1);
      expect(report.status).to.equal(ReportStatus.VERIFIED);
      expect(report.rewardAmount).to.equal(ethers.parseEther("0.01"));
    });
  });

  describe("Report Status Management", function () {
    beforeEach(async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Status Test"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await contract.connect(reporter1).submitReport(
        reportHash,
        IncidentType.DEFORESTATION,
        SeverityLevel.MEDIUM,
        -1270000,
        36820000,
        "Location",
        evidenceHash,
        false
      );
    });

    it("Should allow rangers to update status", async function () {
      await expect(
        contract.connect(ranger1).updateReportStatus(1, ReportStatus.INVESTIGATING)
      ).to.emit(contract, "ReportStatusUpdated")
        .withArgs(1, ReportStatus.PENDING, ReportStatus.INVESTIGATING, await ethers.provider.getBlock('latest').then(b => b.timestamp));
    });

    it("Should reject status update from non-rangers", async function () {
      await expect(
        contract.connect(reporter1).updateReportStatus(1, ReportStatus.RESOLVED)
      ).to.be.revertedWith("Not authorized ranger");
    });
  });

  describe("Ranger Management", function () {
    it("Should allow owner to authorize rangers", async function () {
      const newRanger = reporter2;
      
      await expect(contract.authorizeRanger(newRanger.address))
        .to.emit(contract, "RangerAuthorized")
        .withArgs(newRanger.address);
      
      expect(await contract.authorizedRangers(newRanger.address)).to.equal(true);
    });

    it("Should allow owner to revoke rangers", async function () {
      await expect(contract.revokeRanger(ranger1.address))
        .to.emit(contract, "RangerRevoked")
        .withArgs(ranger1.address);
      
      expect(await contract.authorizedRangers(ranger1.address)).to.equal(false);
    });

    it("Should reject ranger authorization from non-owner", async function () {
      await expect(
        contract.connect(reporter1).authorizeRanger(reporter2.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reward System", function () {
    beforeEach(async function () {
      // Submit report
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Reward Test"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await contract.connect(reporter1).submitReport(
        reportHash,
        IncidentType.POLLUTION,
        SeverityLevel.HIGH,
        -1270000,
        36820000,
        "Location",
        evidenceHash,
        false
      );
      
      // Add funds to contract
      await contract.addRewardPool({ value: ethers.parseEther("1.0") });
      
      // Verify report (3 verifications)
      await contract.connect(ranger1).verifyReport(1, true, "Verified");
      await contract.connect(ranger2).verifyReport(1, true, "Verified");
      await contract.connect(owner).verifyReport(1, true, "Verified");
    });

    it("Should allow reporter to claim reward", async function () {
      const initialBalance = await ethers.provider.getBalance(reporter1.address);
      
      await expect(
        contract.connect(reporter1).claimReward(1, reporter1.address)
      ).to.emit(contract, "RewardClaimed")
        .withArgs(1, reporter1.address, ethers.parseEther("0.01"));
      
      const finalBalance = await ethers.provider.getBalance(reporter1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject reward claim for unverified reports", async function () {
      // Submit new unverified report
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Unverified"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await contract.connect(reporter2).submitReport(
        reportHash,
        IncidentType.TREE_DISEASE,
        SeverityLevel.LOW,
        -1270000,
        36820000,
        "Location",
        evidenceHash,
        false
      );
      
      await expect(
        contract.connect(reporter2).claimReward(2, reporter2.address)
      ).to.be.revertedWith("Report not verified");
    });
  });

  describe("View Functions", function () {
    it("Should return report details", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("View Test"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await contract.connect(reporter1).submitReport(
        reportHash,
        IncidentType.WILDFIRE,
        SeverityLevel.CRITICAL,
        -1270000,
        36820000,
        "Karura Forest",
        evidenceHash,
        true
      );
      
      const report = await contract.getReport(1);
      expect(report.reportHash).to.equal(reportHash);
      expect(report.incidentType).to.equal(IncidentType.WILDFIRE);
      expect(report.severity).to.equal(SeverityLevel.CRITICAL);
      expect(report.locationDescription).to.equal("Karura Forest");
      expect(report.isAnonymous).to.equal(true);
    });

    it("Should return user reports", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("Report 1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("Report 2"));
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Evidence"));
      
      await contract.connect(reporter1).submitReport(
        hash1,
        IncidentType.ILLEGAL_LOGGING,
        SeverityLevel.HIGH,
        -1270000,
        36820000,
        "Location 1",
        evidenceHash,
        false
      );
      
      await contract.connect(reporter1).submitReport(
        hash2,
        IncidentType.DEFORESTATION,
        SeverityLevel.MEDIUM,
        -1280000,
        36830000,
        "Location 2",
        evidenceHash,
        false
      );
      
      const userReports = await contract.getUserReports(reporter1.address);
      expect(userReports.length).to.equal(2);
      expect(userReports[0]).to.equal(1);
      expect(userReports[1]).to.equal(2);
    });
  });
});
