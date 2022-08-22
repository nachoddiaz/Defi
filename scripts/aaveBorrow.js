const { getNamedAccounts, ethers, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()

    //Addresses
    const wethTokenAddress = networkConfig[network.config.chainId].wethToken
    const DAITokenAddress = networkConfig[network.config.chainId].daiToken

    //Getting the lending contract
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address is ${lendingPool.address}`)

    //Deposit funds
    
    //approve
    await  aproveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log(`Depositing funds....`)
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log(`Funds deposited!!`)


    //Borrow
    //¿How much can we borrow? -> getUserAccountData
    let {totalDebtETH, availableBorrowsETH} = await getBorrowUserData(lendingPool, deployer)
    const DAIprice = await getDaiPrice()
    const amountDaitoBorrow = availableBorrowsETH.toString() *0.95* (1/DAIprice)
    console.log(`You can borrow ${amountDaitoBorrow} DAI`)
    const amountDaitoBorrowWEI = ethers.utils.parseEther(amountDaitoBorrow.toString())

    
    await BorrowDAI(DAITokenAddress, lendingPool, amountDaitoBorrowWEI, deployer)
    await getBorrowUserData(lendingPool, deployer)

    await RepayDAI(amountDaitoBorrowWEI, DAITokenAddress,lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function getLendingPool(account) {
    //0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        account
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function aproveERC20(ERC20Address, spenderAddress, ammount, account) {
    const ERC20Token = await ethers.getContractAt("IERC20", ERC20Address, account)
    const tx = await ERC20Token.approve(spenderAddress, ammount)
    await tx.wait(1)
    console.log("Spent Approved!!")
}

async function getBorrowUserData(lendingPool, account) {
    const {totalCollateralETH, totalDebtETH, availableBorrowsETH} = await lendingPool.getUserAccountData(account)
    console.log(`You have a total Collateral of ${totalCollateralETH/(10e18)} ETH`)
    console.log(`You have borrowed ${totalDebtETH/(10e18)} ETH`)
    console.log(`You have the capacity to borrow up to ${availableBorrowsETH/(10e18)} ETH`)

    return {totalDebtETH, availableBorrowsETH}
}

async function getDaiPrice() {
    const DAIETHPrice = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId].daiEthPriceFeed
    )
    //Cogemos solo el segundo elemento del array -> Respuesta
    const price = (await DAIETHPrice.latestRoundData())[1]
    console.log(`The ETH/DAI price is ${(10e18)/price.toString()}`)
    return price
}


async function BorrowDAI(daiAddress, lendingPool, ammountDAIinWEI, account){
    //The 1 in [2] refers to a StableInterestRate, 2 is for Variable.  The 0 in [3] is for the referral code
    const tx = await lendingPool.borrow(daiAddress, ammountDAIinWEI, 1, 0, account)
    await tx.wait(1)
    console.log("Borrow aproved!!")

}

async function RepayDAI(ammountDAIinWEI, daiAddress, lendingPool, account ){
    await aproveERC20(daiAddress, lendingPool.address, ammountDAIinWEI, account)
    const repaytx = await lendingPool.repay(daiAddress, ammountDAIinWEI, 1, account)
    await repaytx.wait(1)
    console.log("Loan repaid!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
