// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/abstracts/EIP712WithSecurity.sol";

contract KimikoReputation is EIP712WithSecurity {
    // Encrypted privacy scores mapped to wallet addresses
    mapping(address => euint8) private encryptedScores;
    
    // The authority that can update scores (Kimiko backend)
    address public owner;

    event ScoreUpdated(address indexed wallet);

    constructor() EIP712WithSecurity("Kimiko", "1") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Kimiko can update scores");
        _;
    }

    /**
     * @dev Set an encrypted score for a user.
     * @param wallet The user's wallet address.
     * @param encryptedScore The score encrypted via Inco's public key.
     */
    function updateScore(address wallet, bytes calldata encryptedScore) external onlyOwner {
        encryptedScores[wallet] = TFHE.asEuint8(encryptedScore);
        emit ScoreUpdated(wallet);
    }

    /**
     * @dev Check if a user's score is above a threshold without revealing it.
     * @param wallet The user's wallet address.
     * @param threshold The public threshold to check against.
     * @return result Encrypted boolean (ebool) indicating if score >= threshold.
     */
    function isCompliant(address wallet, uint8 threshold) external view returns (ebool) {
        euint8 score = encryptedScores[wallet];
        return TFHE.ge(score, threshold);
    }
}
