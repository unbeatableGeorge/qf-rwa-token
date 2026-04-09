const { expect } = require("chai");

describe("RWAToken", function () {
    let token;
    let owner, addr1, addr2, addr3;

    beforeEach(async function () {
        const RWAToken = await ethers.getContractFactory("RWAToken");
        token = await RWAToken.deploy();
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
    });

    // ==================== Ownership Tests ====================
    describe("Ownership", function () {
        it("Should set the right owner on deployment", async function () {
            expect(await token.owner()).to.equal(owner.address);
        });

        it("Should transfer ownership", async function () {
            await token.transferOwnership(addr1.address);
            expect(await token.owner()).to.equal(addr1.address);
        });

        it("Should add new owner to whitelist on ownership transfer", async function () {
            await token.transferOwnership(addr1.address);
            const whitelisted = await token.getWhitelisted();
            expect(whitelisted).to.include(addr1.address);
        });

        it("Should prevent non-owner from transferring ownership", async function () {
            await expect(
                token.connect(addr1).transferOwnership(addr2.address)
            ).to.be.revertedWith("Only owner can call this function");
        });
    });

    // ==================== Whitelist Tests ====================
    describe("Whitelist Management", function () {
        it("Owner should be whitelisted by default", async function () {
            expect(await token.isWhitelisted(owner.address)).to.be.true;
        });

        it("Should add address to whitelist", async function () {
            await token.setWhitelisted(addr1.address, true);
            expect(await token.isWhitelisted(addr1.address)).to.be.true;
        });

        it("Should remove address from whitelist", async function () {
            await token.setWhitelisted(addr1.address, true);
            expect(await token.isWhitelisted(addr1.address)).to.be.true;

            await token.setWhitelisted(addr1.address, false);
            expect(await token.isWhitelisted(addr1.address)).to.be.false;
        });

        it("Should prevent non-owner from managing whitelist", async function () {
            await expect(
                token.connect(addr1).setWhitelisted(addr2.address, true)
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("Should enumerate whitelisted addresses", async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.setWhitelisted(addr2.address, true);

            const whitelisted = await token.getWhitelisted();
            expect(whitelisted).to.include(owner.address);
            expect(whitelisted).to.include(addr1.address);
            expect(whitelisted).to.include(addr2.address);
            expect(whitelisted.length).to.equal(3);
        });

        it("Should correctly update enumeration when removing from whitelist", async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.setWhitelisted(addr2.address, true);

            await token.setWhitelisted(addr1.address, false);

            const whitelisted = await token.getWhitelisted();
            expect(whitelisted).to.not.include(addr1.address);
            expect(whitelisted).to.include(addr2.address);
            expect(whitelisted.length).to.equal(2);
        });
    });

    // ==================== Mint Tests ====================
    describe("Mint", function () {
        it("Owner should mint to whitelisted address", async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.mint(addr1.address, ethers.parseUnits("100", 18));

            expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("100", 18));
        });

        it("Should increase totalSupply on mint", async function () {
            const initialSupply = await token.totalSupply();
            await token.setWhitelisted(addr1.address, true);
            await token.mint(addr1.address, ethers.parseUnits("100", 18));

            const newSupply = await token.totalSupply();
            expect(newSupply).to.equal(
                initialSupply + ethers.parseUnits("100", 18)
            );
        });

        it("Should prevent minting to non-whitelisted address", async function () {
            await expect(
                token.mint(addr1.address, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("Recipient not whitelisted");
        });

        it("Should prevent non-owner from minting", async function () {
            await token.setWhitelisted(addr1.address, true);
            await expect(
                token.connect(addr1).mint(addr1.address, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("Should emit Transfer event on mint", async function () {
            await token.setWhitelisted(addr1.address, true);
            await expect(
                token.mint(addr1.address, ethers.parseUnits("100", 18))
            )
                .to.emit(token, "Transfer")
                .withArgs(ethers.ZeroAddress, addr1.address, ethers.parseUnits("100", 18));
        });
    });

    // ==================== Transfer Tests ====================
    describe("Transfer", function () {
        beforeEach(async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.setWhitelisted(addr2.address, true);
            await token.mint(addr1.address, ethers.parseUnits("100", 18));
        });

        it("Should transfer between whitelisted addresses", async function () {
            await token.connect(addr1).transfer(addr2.address, ethers.parseUnits("50", 18));

            expect(await token.balanceOf(addr1.address)).to.equal(
                ethers.parseUnits("50", 18)
            );
            expect(await token.balanceOf(addr2.address)).to.equal(
                ethers.parseUnits("50", 18)
            );
        });

        it("Should prevent transfer to non-whitelisted address", async function () {
            await expect(
                token.connect(addr1).transfer(addr3.address, ethers.parseUnits("50", 18))
            ).to.be.revertedWith("Recipient not whitelisted");
        });

        it("Should prevent transfer with insufficient balance", async function () {
            await expect(
                token.connect(addr1).transfer(addr2.address, ethers.parseUnits("200", 18))
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should emit Transfer event", async function () {
            await expect(
                token.connect(addr1).transfer(addr2.address, ethers.parseUnits("50", 18))
            )
                .to.emit(token, "Transfer")
                .withArgs(addr1.address, addr2.address, ethers.parseUnits("50", 18));
        });
    });

    // ==================== Burn Tests ====================
    describe("Burn", function () {
        beforeEach(async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.mint(addr1.address, ethers.parseUnits("100", 18));
        });

        it("Should burn tokens from caller balance", async function () {
            await token.connect(addr1).burn(ethers.parseUnits("50", 18));

            expect(await token.balanceOf(addr1.address)).to.equal(
                ethers.parseUnits("50", 18)
            );
        });

        it("Should decrease totalSupply on burn", async function () {
            const initialSupply = await token.totalSupply();
            await token.connect(addr1).burn(ethers.parseUnits("50", 18));

            const newSupply = await token.totalSupply();
            expect(newSupply).to.equal(initialSupply - ethers.parseUnits("50", 18));
        });

        it("Should prevent burn with insufficient balance", async function () {
            await expect(
                token.connect(addr1).burn(ethers.parseUnits("200", 18))
            ).to.be.revertedWith("Insufficient balance to burn");
        });

        it("Should emit Transfer event on burn (to zero address)", async function () {
            await expect(
                token.connect(addr1).burn(ethers.parseUnits("50", 18))
            )
                .to.emit(token, "Transfer")
                .withArgs(addr1.address, ethers.ZeroAddress, ethers.parseUnits("50", 18));
        });
    });

    // ==================== BurnFrom Tests ====================
    describe("BurnFrom", function () {
        beforeEach(async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.setWhitelisted(addr2.address, true);
            await token.mint(addr1.address, ethers.parseUnits("100", 18));
        });

        it("Should burn tokens with allowance", async function () {
            await token.connect(addr1).approve(addr2.address, ethers.parseUnits("50", 18));
            await token.connect(addr2).burnFrom(addr1.address, ethers.parseUnits("50", 18));

            expect(await token.balanceOf(addr1.address)).to.equal(
                ethers.parseUnits("50", 18)
            );
        });

        it("Should prevent burnFrom with insufficient allowance", async function () {
            await token.connect(addr1).approve(addr2.address, ethers.parseUnits("30", 18));
            await expect(
                token.connect(addr2).burnFrom(addr1.address, ethers.parseUnits("50", 18))
            ).to.be.revertedWith("Insufficient allowance to burn");
        });

        it("Should decrease allowance after burnFrom", async function () {
            await token.connect(addr1).approve(addr2.address, ethers.parseUnits("100", 18));
            await token.connect(addr2).burnFrom(addr1.address, ethers.parseUnits("50", 18));

            const remaining = await token.allowance(addr1.address, addr2.address);
            expect(remaining).to.equal(ethers.parseUnits("50", 18));
        });
    });

    // ==================== TransferFrom Tests ====================
    describe("TransferFrom", function () {
        beforeEach(async function () {
            await token.setWhitelisted(addr1.address, true);
            await token.setWhitelisted(addr2.address, true);
            await token.mint(addr1.address, ethers.parseUnits("100", 18));
        });

        it("Should transferFrom with approval", async function () {
            await token.connect(addr1).approve(addr2.address, ethers.parseUnits("50", 18));
            await token.connect(addr2).transferFrom(addr1.address, addr2.address, ethers.parseUnits("50", 18));

            expect(await token.balanceOf(addr1.address)).to.equal(
                ethers.parseUnits("50", 18)
            );
            expect(await token.balanceOf(addr2.address)).to.equal(
                ethers.parseUnits("50", 18)
            );
        });

        it("Should prevent transferFrom to non-whitelisted address", async function () {
            await token.connect(addr1).approve(addr2.address, ethers.parseUnits("50", 18));
            await expect(
                token.connect(addr2).transferFrom(addr1.address, addr3.address, ethers.parseUnits("50", 18))
            ).to.be.revertedWith("Recipient not whitelisted");
        });

        it("Should prevent transferFrom with insufficient allowance", async function () {
            await token.connect(addr1).approve(addr2.address, ethers.parseUnits("30", 18));
            await expect(
                token.connect(addr2).transferFrom(addr1.address, addr2.address, ethers.parseUnits("50", 18))
            ).to.be.revertedWith("Insufficient allowance");
        });
    });

    // ==================== Approval Tests ====================
    describe("Approval", function () {
        it("Should approve and check allowance", async function () {
            await token.approve(addr1.address, ethers.parseUnits("100", 18));
            expect(await token.allowance(owner.address, addr1.address)).to.equal(
                ethers.parseUnits("100", 18)
            );
        });

        it("Should emit Approval event", async function () {
            await expect(token.approve(addr1.address, ethers.parseUnits("100", 18)))
                .to.emit(token, "Approval")
                .withArgs(owner.address, addr1.address, ethers.parseUnits("100", 18));
        });
    });

    // ==================== Metadata Tests ====================
    describe("Token Metadata", function () {
        it("Should have correct name", async function () {
            expect(await token.name()).to.equal("RWA Investment Token");
        });

        it("Should have correct symbol", async function () {
            expect(await token.symbol()).to.equal("RWAT");
        });

        it("Should have correct decimals", async function () {
            expect(await token.decimals()).to.equal(18);
        });

        it("Should have correct initial totalSupply", async function () {
            const expectedSupply = ethers.parseUnits("1000000", 18);
            expect(await token.totalSupply()).to.equal(expectedSupply);
        });
    });
});
