async function main() {
  const YatrikaLedger = await ethers.getContractFactory("YatrikaLedger");
  console.log("Deploying YatrikaLedger...");
  const ledger = await YatrikaLedger.deploy();
  await ledger.waitForDeployment();
  const address = await ledger.getAddress();
  const block = await ethers.provider.getBlockNumber();
  console.log(`✅ YatrikaLedger deployed to: ${address}`);
  console.log(`✅ Deployed in block number: ${block}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });