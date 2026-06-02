package es.uniovi.recyclechain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents an individual physical container unit with a unique QR code.
 *
 * Each Container is generated from a ContainerBatch and has a unique UUID
 * printed as a QR code on the physical packaging. The UUID has no semantic
 * meaning to prevent reverse engineering of the batch structure.
 *
 * State machine: UNSCANNED → SCANNED → DEPOSITED
 *   - UNSCANNED: QR printed, not yet scanned by any user
 *   - SCANNED:   user has scanned the container QR at home;
 *                container is linked to the user account and
 *                appears in their pending containers list
 *   - DEPOSITED: user has confirmed physical deposit at a recycling
 *                station; RCYC tokens have been issued
 *
 * The UUID is single-use: once DEPOSITED, the QR cannot be reused.
 * This prevents duplicate token issuance for the same physical container.
 *
 * Future work (Sprint 9+): IoT sensor at the station detects the physical
 * deposit within a 15-second window and confirms DEPOSITED state
 * independently of user action, closing the remaining fraud vector.
 */
@Entity
@Table(name = "container")
public class Container {

    public enum ContainerStatus {
        UNSCANNED, SCANNED, DEPOSITED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique identifier encoded in the printed QR code.
     * Generated automatically on entity creation via @PrePersist.
     */
    @Column(nullable = false, unique = true)
    private String uuid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContainerStatus status = ContainerStatus.UNSCANNED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ContainerBatch batch;

    /**
     * The user who scanned this container. Null until first scan.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @Column(name = "deposited_at")
    private LocalDateTime depositedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }

    public Container() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUuid() { return uuid; }
    public void setUuid(String uuid) { this.uuid = uuid; }

    public ContainerStatus getStatus() { return status; }
    public void setStatus(ContainerStatus status) { this.status = status; }

    public ContainerBatch getBatch() { return batch; }
    public void setBatch(ContainerBatch batch) { this.batch = batch; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }

    public LocalDateTime getDepositedAt() { return depositedAt; }
    public void setDepositedAt(LocalDateTime depositedAt) { this.depositedAt = depositedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}