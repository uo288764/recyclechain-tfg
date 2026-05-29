package es.uniovi.recyclechain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Tracks QR codes that have already been used for a recycling event.
 * Prevents the same QR code from being reused (FR-21).
 *
 * Each entry stores the HMAC payload of a consumed QR code alongside
 * the timestamp of its use. Expired entries can be periodically cleaned up
 * without affecting security, as expired codes are already rejected by
 * the time window check (FR-22) before reaching this table.
 */
@Entity
@Table(name = "used_qr_code", indexes = {
        @Index(name = "idx_used_qr_payload", columnList = "payload", unique = true)
})
public class UsedQRCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The full QR payload string (HMAC hex + metadata).
     * Stored as a unique index for O(1) lookup on validation.
     */
    @Column(nullable = false, unique = true, length = 512)
    private String payload;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    public UsedQRCode() {
    }

    public UsedQRCode(String payload, Station station) {
        this.payload = payload;
        this.station = station;
        this.usedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public Station getStation() { return station; }
    public void setStation(Station station) { this.station = station; }
}