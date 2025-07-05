require('dotenv').config();
const fs = require('fs');
const { ethers } = require('ethers');

// Load konfigurasi
const receivers = JSON.parse(fs.readFileSync('./wallets.json')).receivers;
const privateKeys = process.env.PRIVATE_KEYS.split(',');
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

async function sendEth() {
  const amount = ethers.utils.parseEther(process.env.DEFAULT_AMOUNT_ETH);
  const maxGasPrice = ethers.utils.parseUnits(process.env.MAX_GAS_PRICE_GWEI, 'gwei');
  
  for (const privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey.trim(), provider);
    console.log(`\nMenggunakan wallet: ${wallet.address}`);

    for (const receiver of receivers) {
      try {
        const gasPrice = await provider.getGasPrice();
        const actualGasPrice = gasPrice.gt(maxGasPrice) ? maxGasPrice : gasPrice;
        
        const tx = await wallet.sendTransaction({
          to: receiver,
          value: amount,
          gasPrice: actualGasPrice,
          gasLimit: process.env.GAS_LIMIT
        });

        console.log(`  ✅ Terkirim ${process.env.DEFAULT_AMOUNT_ETH} ETH ke ${receiver.substring(0, 8)}...`);
        console.log(`     Tx Hash: ${tx.hash}`);

        await tx.wait();
        console.log(`     Dikonfirmasi`);
      } catch (error) {
        console.log(`  ❌ Gagal ke ${receiver.substring(0, 8)}...: ${error.message}`);
      }
    }
  }
}

sendEth().catch(console.error);
