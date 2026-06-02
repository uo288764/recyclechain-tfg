package es.uniovi.recyclechain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a recycling campaign managed by the administrator.
 *
 * A campaign defines the time window and gamification parameters under which
 * recycling events are registered and RCYC tokens are issued. Once a campaign
 * transitions to ACTIVE state, all its parameters become immutable — this is a
 * deliberate architectural decision to maintain consistency with the immutability
 * guarantees of the blockchain layer (Wood, 2014).
 *
 * State machine: DRAFT → ACTIVE → CLOSED
 *   - DRAFT:  editable, no recycling events accepted
 *   - ACTIVE: immutable, recycling events accepted, only one allowed at a time
 *   - CLOSED: immutable, lottery pending (Sprint 8.5) or completed
 *
 * Material multipliers and milestone bonuses are stored per-campaign so that
 * each campaign has an independent, auditable snapshot of its parameters.
 * Default values are loaded from application.properties to pre-fill the admin
 * creation form but are not the runtime source of truth.
 */
@Entity
@Table(name = "campaign")
public class Campaign {

    public enum Status {
        DRAFT, ACTIVE, CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.DRAFT;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // --- Material multipliers (snapshot at activation) ---

    @Column(name = "multiplier_plastic", nullable = false)
    private Double multiplierPlastic = 1.2;

    @Column(name = "multiplier_metal", nullable = false)
    private Double multiplierMetal = 1.5;

    @Column(name = "multiplier_glass", nullable = false)
    private Double multiplierGlass = 0.8;

    @Column(name = "multiplier_paper", nullable = false)
    private Double multiplierPaper = 0.6;

    @Column(name = "multiplier_organic", nullable = false)
    private Double multiplierOrganic = 0.5;

    // --- Event-based milestone bonuses ---

    @Column(name = "milestone_events_tier1", nullable = false)
    private Integer milestoneEventsTier1 = 5;

    @Column(name = "milestone_events_tier2", nullable = false)
    private Integer milestoneEventsTier2 = 12;

    @Column(name = "milestone_events_tier3", nullable = false)
    private Integer milestoneEventsTier3 = 25;

    @Column(name = "milestone_events_tier4", nullable = false)
    private Integer milestoneEventsTier4 = 50;

    @Column(name = "milestone_events_bonus_tier1", nullable = false)
    private Double milestoneEventsBonusTier1 = 1.1;

    @Column(name = "milestone_events_bonus_tier2", nullable = false)
    private Double milestoneEventsBonusTier2 = 1.2;

    @Column(name = "milestone_events_bonus_tier3", nullable = false)
    private Double milestoneEventsBonusTier3 = 1.35;

    @Column(name = "milestone_events_bonus_tier4", nullable = false)
    private Double milestoneEventsBonusTier4 = 1.5;

    // --- Weight-based milestone bonuses ---

    @Column(name = "milestone_weight_tier1", nullable = false)
    private Double milestoneWeightTier1 = 5.0;

    @Column(name = "milestone_weight_tier2", nullable = false)
    private Double milestoneWeightTier2 = 15.0;

    @Column(name = "milestone_weight_tier3", nullable = false)
    private Double milestoneWeightTier3 = 35.0;

    @Column(name = "milestone_weight_tier4", nullable = false)
    private Double milestoneWeightTier4 = 75.0;

    @Column(name = "milestone_weight_bonus_tier1", nullable = false)
    private Double milestoneWeightBonusTier1 = 1.05;

    @Column(name = "milestone_weight_bonus_tier2", nullable = false)
    private Double milestoneWeightBonusTier2 = 1.1;

    @Column(name = "milestone_weight_bonus_tier3", nullable = false)
    private Double milestoneWeightBonusTier3 = 1.15;

    @Column(name = "milestone_weight_bonus_tier4", nullable = false)
    private Double milestoneWeightBonusTier4 = 1.25;

    // --- Lottery fields (populated in Sprint 8.5) ---

    @Column(name = "prize_pool_eth")
    private Double prizePoolEth;

    @Column(name = "parameter_hash")
    private String parameterHash;

    @Column(name = "vrf_request_id")
    private String vrfRequestId;

    @Column(name = "winner_address")
    private String winnerAddress;

    // --- Audit fields ---

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Campaign() {}

    // --- Getters and setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Double getMultiplierPlastic() { return multiplierPlastic; }
    public void setMultiplierPlastic(Double multiplierPlastic) { this.multiplierPlastic = multiplierPlastic; }

    public Double getMultiplierMetal() { return multiplierMetal; }
    public void setMultiplierMetal(Double multiplierMetal) { this.multiplierMetal = multiplierMetal; }

    public Double getMultiplierGlass() { return multiplierGlass; }
    public void setMultiplierGlass(Double multiplierGlass) { this.multiplierGlass = multiplierGlass; }

    public Double getMultiplierPaper() { return multiplierPaper; }
    public void setMultiplierPaper(Double multiplierPaper) { this.multiplierPaper = multiplierPaper; }

    public Double getMultiplierOrganic() { return multiplierOrganic; }
    public void setMultiplierOrganic(Double multiplierOrganic) { this.multiplierOrganic = multiplierOrganic; }

    public Integer getMilestoneEventsTier1() { return milestoneEventsTier1; }
    public void setMilestoneEventsTier1(Integer v) { this.milestoneEventsTier1 = v; }

    public Integer getMilestoneEventsTier2() { return milestoneEventsTier2; }
    public void setMilestoneEventsTier2(Integer v) { this.milestoneEventsTier2 = v; }

    public Integer getMilestoneEventsTier3() { return milestoneEventsTier3; }
    public void setMilestoneEventsTier3(Integer v) { this.milestoneEventsTier3 = v; }

    public Integer getMilestoneEventsTier4() { return milestoneEventsTier4; }
    public void setMilestoneEventsTier4(Integer v) { this.milestoneEventsTier4 = v; }

    public Double getMilestoneEventsBonusTier1() { return milestoneEventsBonusTier1; }
    public void setMilestoneEventsBonusTier1(Double v) { this.milestoneEventsBonusTier1 = v; }

    public Double getMilestoneEventsBonusTier2() { return milestoneEventsBonusTier2; }
    public void setMilestoneEventsBonusTier2(Double v) { this.milestoneEventsBonusTier2 = v; }

    public Double getMilestoneEventsBonusTier3() { return milestoneEventsBonusTier3; }
    public void setMilestoneEventsBonusTier3(Double v) { this.milestoneEventsBonusTier3 = v; }

    public Double getMilestoneEventsBonusTier4() { return milestoneEventsBonusTier4; }
    public void setMilestoneEventsBonusTier4(Double v) { this.milestoneEventsBonusTier4 = v; }

    public Double getMilestoneWeightTier1() { return milestoneWeightTier1; }
    public void setMilestoneWeightTier1(Double v) { this.milestoneWeightTier1 = v; }

    public Double getMilestoneWeightTier2() { return milestoneWeightTier2; }
    public void setMilestoneWeightTier2(Double v) { this.milestoneWeightTier2 = v; }

    public Double getMilestoneWeightTier3() { return milestoneWeightTier3; }
    public void setMilestoneWeightTier3(Double v) { this.milestoneWeightTier3 = v; }

    public Double getMilestoneWeightTier4() { return milestoneWeightTier4; }
    public void setMilestoneWeightTier4(Double v) { this.milestoneWeightTier4 = v; }

    public Double getMilestoneWeightBonusTier1() { return milestoneWeightBonusTier1; }
    public void setMilestoneWeightBonusTier1(Double v) { this.milestoneWeightBonusTier1 = v; }

    public Double getMilestoneWeightBonusTier2() { return milestoneWeightBonusTier2; }
    public void setMilestoneWeightBonusTier2(Double v) { this.milestoneWeightBonusTier2 = v; }

    public Double getMilestoneWeightBonusTier3() { return milestoneWeightBonusTier3; }
    public void setMilestoneWeightBonusTier3(Double v) { this.milestoneWeightBonusTier3 = v; }

    public Double getMilestoneWeightBonusTier4() { return milestoneWeightBonusTier4; }
    public void setMilestoneWeightBonusTier4(Double v) { this.milestoneWeightBonusTier4 = v; }

    public Double getPrizePoolEth() { return prizePoolEth; }
    public void setPrizePoolEth(Double prizePoolEth) { this.prizePoolEth = prizePoolEth; }

    public String getParameterHash() { return parameterHash; }
    public void setParameterHash(String parameterHash) { this.parameterHash = parameterHash; }

    public String getVrfRequestId() { return vrfRequestId; }
    public void setVrfRequestId(String vrfRequestId) { this.vrfRequestId = vrfRequestId; }

    public String getWinnerAddress() { return winnerAddress; }
    public void setWinnerAddress(String winnerAddress) { this.winnerAddress = winnerAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getActivatedAt() { return activatedAt; }
    public void setActivatedAt(LocalDateTime activatedAt) { this.activatedAt = activatedAt; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
}