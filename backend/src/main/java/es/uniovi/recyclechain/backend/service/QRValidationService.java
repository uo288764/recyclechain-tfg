package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.model.UsedQRCode;
import es.uniovi.recyclechain.backend.repository.UsedQRCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

/**
 * QR Code Validation Service
 *
 * Implements the fraud prevention mechanism for recycling station QR codes.
 * The approach follows the same principles as TOTP (Time-based One-Time Password)
 * as defined in RFC 6238 (M'Raihi et al., 2011).
 *
 * QR Payload format:
 *   {stationId}:{timestampWindow}:{hmac}
 *
 * Where:
 *   - stationId:       the station's database ID
 *   - timestampWindow: current Unix epoch divided by window size (seconds),
 *                      producing a stable value across the entire validity window
 *   - hmac:            HMAC-SHA256(station.secretKey, stationId || ":" || timestampWindow)
 *                      encoded as lowercase hex
 *
 * Validation checks (both must pass — FR-21, FR-22):
 *   1. HMAC is valid for the current OR the immediately preceding window
 *      (one-window tolerance prevents rejecting codes scanned at window boundaries)
 *   2. The exact payload has not been used before (single-use invalidation)
 *
 * References:
 *   M'Raihi, D. et al. (2005). RFC 4226: HOTP. IETF.
 *   M'Raihi, D. et al. (2011). RFC 6238: TOTP. IETF.
 *   Katz, J., & Lindell, Y. (2020). Introduction to Modern Cryptography (3rd ed.). CRC Press.
 */
@Service
public class QRValidationService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    /**
     * Duration of each time window in seconds.
     * Default: 300 seconds (5 minutes). Configurable in application.properties.
     */
    @Value("${qr.window.seconds:300}")
    private long windowSeconds;

    @Autowired
    private UsedQRCodeRepository usedQRCodeRepository;

    /**
     * Generates the QR payload for a given station at the current time window.
     *
     * @param station the station for which to generate the QR code
     * @return the QR payload string to be encoded as a QR image
     */
    public String generateQRPayload(Station station) {
        long window = currentWindow();
        String hmac = computeHmac(station.getSecretKey(), station.getId(), window);
        return station.getId() + ":" + window + ":" + hmac;
    }

    /**
     * Validates a scanned QR payload against a station.
     *
     * Performs three checks in order:
     *   1. Parses and extracts fields from the payload
     *   2. Verifies the HMAC against current and previous windows (FR-22)
     *   3. Verifies the payload has not been used before (FR-21)
     *
     * If all checks pass, marks the payload as used.
     *
     * @param payload the raw string scanned from the QR code
     * @param station the station the user claims to be recycling at
     * @return true if valid and unused; false otherwise
     */
    public boolean validateAndConsume(String payload, Station station) {
        if (payload == null || station == null) {
            return false;
        }

        String[] parts = payload.split(":");
        if (parts.length != 3) {
            return false;
        }

        Long payloadStationId;
        long payloadWindow;
        String payloadHmac;

        try {
            payloadStationId = Long.valueOf(parts[0]);
            payloadWindow    = Long.parseLong(parts[1]);
            payloadHmac      = parts[2];
        } catch (NumberFormatException e) {
            return false;
        }

        // Station ID in payload must match the station being validated
        if (!payloadStationId.equals(station.getId())) {
            return false;
        }

        // Check HMAC against current window and one previous window (boundary tolerance)
        long currentWindow = currentWindow();
        boolean hmacValid =
                computeHmac(station.getSecretKey(), station.getId(), currentWindow).equals(payloadHmac)
                || computeHmac(station.getSecretKey(), station.getId(), currentWindow - 1).equals(payloadHmac);

        if (!hmacValid) {
            return false;
        }

        // Reject if payload window is too old (outside allowed tolerance)
        if (currentWindow - payloadWindow > 1) {
            return false;
        }

        // Single-use check: reject if already consumed (FR-21)
        if (usedQRCodeRepository.existsByPayload(payload)) {
            return false;
        }

        // Mark as used
        usedQRCodeRepository.save(new UsedQRCode(payload, station));
        return true;
    }

    /**
     * Computes HMAC-SHA256 of (stationId + ":" + window) using the station secret key.
     *
     * @param secretKey   the station's HMAC secret key
     * @param stationId   the station database ID
     * @param window      the time window index
     * @return lowercase hex-encoded HMAC digest
     */
    private String computeHmac(String secretKey, Long stationId, long window) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM
            );
            mac.init(keySpec);
            String message = stationId + ":" + window;
            byte[] digest = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 computation failed", e);
        }
    }

    /**
     * Returns the current time window index.
     * Dividing the epoch by windowSeconds produces a stable integer
     * that changes only when a new window begins.
     */
    private long currentWindow() {
        return Instant.now().getEpochSecond() / windowSeconds;
    }
}