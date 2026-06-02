package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.model.Campaign;
import es.uniovi.recyclechain.backend.model.RecyclingEvent;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.repository.CampaignRepository;
import es.uniovi.recyclechain.backend.repository.RecyclingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

/**
 * Recycling Event Service
 *
 * Manages all business logic related to recycling events, including:
 * - CRUD operations for recycling events
 * - Token calculation with configurable gamification system
 * - User statistics and achievement tracking
 *
 * Token Calculation System:
 * -------------------------
 * Tokens are calculated using a multi-layered approach:
 *
 * 1. Base Reward: 1 token for any recycling action (encourages participation)
 *
 * 2. Weight-Based Bonus: Incremental rewards based on recycled weight
 *    - 0-100g: +0.5 tokens (small items like cans)
 *    - 100g-1kg: weight x 2.0
 *    - 1kg-5kg: weight x 3.0
 *    - 5kg+: weight x 4.0 (bulk recycling bonus)
 *
 * 3. Material Multiplier: Environmental priority weighting
 *    Read from the active Campaign entity — each campaign defines its own
 *    multipliers, enabling special campaigns (e.g. plastic bonus month).
 *
 * 4. Event Milestone Bonus: Rewards long-term commitment
 *    Thresholds read from Campaign entity (immutable once ACTIVE).
 *
 * 5. Weight Milestone Bonus: Rewards heavy recyclers
 *    Thresholds read from Campaign entity (immutable once ACTIVE).
 *
 * Final Formula:
 *   tokens = (baseReward + weightBonus x materialMultiplier) x eventBonus x weightBonus
 *
 * Precondition: a Campaign in ACTIVE state must exist.
 * If no active campaign exists, recordEvent returns HTTP 409.
 *
 * @author Carlos
 * @version 2.0
 * @since Sprint 8
 */
@Service
public class RecyclingEventService {

    @Autowired
    private RecyclingEventRepository recyclingEventRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private MessageSource messageSource;

    // -------------------------------------------------------------------------
    // Query methods
    // -------------------------------------------------------------------------

    public RecyclingEvent getRecyclingEvent(Long id) {
        return recyclingEventRepository.findById(id).orElse(null);
    }

    public List<RecyclingEvent> getRecyclingEvents() {
        return recyclingEventRepository.findAll();
    }

    public List<RecyclingEvent> getRecyclingEventsByUser(User user) {
        return recyclingEventRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<RecyclingEvent> getRecyclingEventsByUserId(Long userId) {
        return recyclingEventRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    // -------------------------------------------------------------------------
    // Event recording
    // -------------------------------------------------------------------------

    /**
     * Records a recycling event for the given user and station.
     *
     * Resolves the currently active campaign and uses its parameter snapshot
     * to calculate gamification bonuses. Throws 409 if no campaign is active —
     * recycling events cannot be registered outside a campaign context.
     *
     * @param user             authenticated user performing the recycling action
     * @param station          recycling station where the event takes place
     * @param weight           weight of the recycled material in kilograms
     * @param materialType     material type key: plastic, metal, glass, paper, organic
     * @param transactionHash  on-chain transaction hash (may be null if minting is async)
     * @return the persisted RecyclingEvent with calculated tokens
     */
    public RecyclingEvent addRecyclingEvent(User user, Station station, Double weight,
                                            String materialType, String transactionHash) {
        Campaign campaign = campaignRepository.findByStatus(Campaign.Status.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "No active campaign — recycling events cannot be registered"));

        Double baseTokens = calculateBaseTokens(weight, materialType, campaign);

        int totalEvents = getRecyclingEventsByUser(user).size();
        Double totalWeight = getTotalWeightByUser(user);

        Double eventBonus = calculateEventBonus(totalEvents, campaign);
        Double weightBonus = calculateWeightBonus(totalWeight, campaign);

        Double finalTokens = baseTokens * eventBonus * weightBonus;

        RecyclingEvent event = new RecyclingEvent();
        event.setUser(user);
        event.setStation(station);
        event.setWeight(weight);
        event.setMaterialType(materialType);
        event.setTokensEarned(finalTokens);
        event.setTransactionHash(transactionHash);
        event.setCampaign(campaign);

        return recyclingEventRepository.save(event);
    }

    public void addRecyclingEvent(RecyclingEvent event) {
        recyclingEventRepository.save(event);
    }

    // -------------------------------------------------------------------------
    // Token calculation — reads from Campaign entity, not from config beans
    // -------------------------------------------------------------------------

    /**
     * Calculates base tokens from weight and material type.
     * Material multipliers are read from the Campaign snapshot.
     */
    private Double calculateBaseTokens(Double weight, String materialType, Campaign campaign) {
        double baseReward = 1.0;
        double weightBonus;

        double materialMultiplier = switch (materialType.toLowerCase()) {
            case "plastic"  -> campaign.getMultiplierPlastic();
            case "metal"    -> campaign.getMultiplierMetal();
            case "glass"    -> campaign.getMultiplierGlass();
            case "paper"    -> campaign.getMultiplierPaper();
            case "organic"  -> campaign.getMultiplierOrganic();
            default         -> 1.0;
        };

        if (weight < 0.1) {
            weightBonus = 0.5;
        } else if (weight < 1.0) {
            weightBonus = weight * 2.0;
        } else if (weight < 5.0) {
            weightBonus = weight * 3.0;
        } else {
            weightBonus = weight * 4.0;
        }

        return baseReward + (weightBonus * materialMultiplier);
    }

    /**
     * Calculates the event milestone bonus from the Campaign snapshot.
     * Thresholds are stored per-campaign and are immutable once ACTIVE.
     */
    private Double calculateEventBonus(int totalEvents, Campaign campaign) {
        if (totalEvents >= campaign.getMilestoneEventsTier4()) {
            return campaign.getMilestoneEventsBonusTier4();
        }
        if (totalEvents >= campaign.getMilestoneEventsTier3()) {
            return campaign.getMilestoneEventsBonusTier3();
        }
        if (totalEvents >= campaign.getMilestoneEventsTier2()) {
            return campaign.getMilestoneEventsBonusTier2();
        }
        if (totalEvents >= campaign.getMilestoneEventsTier1()) {
            return campaign.getMilestoneEventsBonusTier1();
        }
        return 1.0;
    }

    /**
     * Calculates the weight milestone bonus from the Campaign snapshot.
     * Thresholds are stored per-campaign and are immutable once ACTIVE.
     */
    private Double calculateWeightBonus(Double totalWeight, Campaign campaign) {
        if (totalWeight >= campaign.getMilestoneWeightTier4()) {
            return campaign.getMilestoneWeightBonusTier4();
        }
        if (totalWeight >= campaign.getMilestoneWeightTier3()) {
            return campaign.getMilestoneWeightBonusTier3();
        }
        if (totalWeight >= campaign.getMilestoneWeightTier2()) {
            return campaign.getMilestoneWeightBonusTier2();
        }
        if (totalWeight >= campaign.getMilestoneWeightTier1()) {
            return campaign.getMilestoneWeightBonusTier1();
        }
        return 1.0;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Double getTotalWeightByUser(User user) {
        return getRecyclingEventsByUser(user).stream()
                .mapToDouble(RecyclingEvent::getWeight)
                .sum();
    }

    // -------------------------------------------------------------------------
    // Stats and achievements
    // -------------------------------------------------------------------------

    /**
     * Returns comprehensive statistics for a user.
     * Bonus calculations use the active campaign if one exists,
     * or fallback to neutral multipliers (1.0) if no campaign is active.
     */
    public UserStats getUserStats(Long userId) {
        List<RecyclingEvent> events = getRecyclingEventsByUserId(userId);

        int totalEvents = events.size();
        Double totalWeight = events.stream()
                .mapToDouble(RecyclingEvent::getWeight)
                .sum();
        Double totalTokens = events.stream()
                .mapToDouble(RecyclingEvent::getTokensEarned)
                .sum();

        // Use active campaign for bonus display; neutral if no campaign is active
        return campaignRepository.findByStatus(Campaign.Status.ACTIVE)
                .map(campaign -> new UserStats(
                        totalEvents, totalWeight, totalTokens,
                        calculateEventBonus(totalEvents, campaign),
                        calculateWeightBonus(totalWeight, campaign)))
                .orElse(new UserStats(totalEvents, totalWeight, totalTokens, 1.0, 1.0));
    }

    /**
     * Returns the internationalised achievement tier label for event count.
     * Requires an active campaign to resolve thresholds.
     * Returns tier0 (no achievement) if no campaign is active.
     */
    public String getEventTier(int events) {
        Locale locale = LocaleContextHolder.getLocale();
        return campaignRepository.findByStatus(Campaign.Status.ACTIVE)
                .map(campaign -> resolveTier(
                        events,
                        campaign.getMilestoneEventsTier1(),
                        campaign.getMilestoneEventsTier2(),
                        campaign.getMilestoneEventsTier3(),
                        campaign.getMilestoneEventsTier4(),
                        "achievement.event",
                        locale))
                .orElse(messageSource.getMessage("achievement.event.tier0", null, locale));
    }

    /**
     * Returns the internationalised achievement tier label for total weight.
     * Requires an active campaign to resolve thresholds.
     * Returns tier0 (no achievement) if no campaign is active.
     */
    public String getWeightTier(Double weight) {
        Locale locale = LocaleContextHolder.getLocale();
        return campaignRepository.findByStatus(Campaign.Status.ACTIVE)
                .map(campaign -> resolveTier(
                        weight.intValue(),
                        campaign.getMilestoneWeightTier1().intValue(),
                        campaign.getMilestoneWeightTier2().intValue(),
                        campaign.getMilestoneWeightTier3().intValue(),
                        campaign.getMilestoneWeightTier4().intValue(),
                        "achievement.weight",
                        locale))
                .orElse(messageSource.getMessage("achievement.weight.tier0", null, locale));
    }

    /**
     * Generic tier resolver to avoid duplicating the threshold comparison logic.
     */
    private String resolveTier(int value, int t1, int t2, int t3, int t4,
                                String prefix, Locale locale) {
        if (value >= t4) {
            return messageSource.getMessage(prefix + ".tier4", null, locale);
        }
        if (value >= t3) {
            return messageSource.getMessage(prefix + ".tier3", null, locale);
        }
        if (value >= t2) {
            return messageSource.getMessage(prefix + ".tier2", null, locale);
        }
        if (value >= t1) {
            return messageSource.getMessage(prefix + ".tier1", null, locale);
        }
        return messageSource.getMessage(prefix + ".tier0", null, locale);
    }

    // -------------------------------------------------------------------------
    // Inner record
    // -------------------------------------------------------------------------

    public record UserStats(int totalEvents, Double totalWeight, Double totalTokens,
                            Double currentEventBonus, Double currentWeightBonus) {
    }
}