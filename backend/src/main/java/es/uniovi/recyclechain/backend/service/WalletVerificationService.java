package es.uniovi.recyclechain.backend.service;

import org.springframework.stereotype.Service;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;

/**
 * Verifies Ethereum wallet signatures using the EIP-191 personal_sign standard.
 */
@Service
public class WalletVerificationService {

    /**
     * Returns true if the signature was produced by the owner of walletAddress.
     */
    public boolean verifySignature(String walletAddress, String message, String signature) {
        try {
            // Hash the message with the Ethereum prefix
            byte[] prefixedHash = Sign.getEthereumMessageHash(message.getBytes());

            // Decode the hex signature into bytes
            byte[] signatureBytes = Numeric.hexStringToByteArray(signature);

            // Split into r, s, v components
            byte[] r = Arrays.copyOfRange(signatureBytes, 0, 32);
            byte[] s = Arrays.copyOfRange(signatureBytes, 32, 64);
            byte v = signatureBytes[64];

            // Normalize v: MetaMask returns 27/28, web3j expects 0/1
            if (v < 27) {
                v += 27;
            }

            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);

            // Recover the public key and derive the address from it
            BigInteger publicKey = Sign.signedMessageHashToKey(prefixedHash, signatureData);
            String recoveredAddress = "0x" + Keys.getAddress(publicKey);

            return recoveredAddress.equalsIgnoreCase(walletAddress);
        } catch (Exception e) {
            return false;
        }
    }
}