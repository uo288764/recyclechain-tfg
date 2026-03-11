package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.config.CampaignConfig;
import es.uniovi.recyclechain.backend.config.MilestoneConfig;
import es.uniovi.recyclechain.backend.model.RecyclingEvent;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.repository.RecyclingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

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
 *    - 100g-1kg: weight × 2.0
 *    - 1kg-5kg: weight × 3.0
 *    - 5kg+: weight × 4.0 (bulk recycling bonus)
 *
 * 3. Material Multiplier: Environmental priority weighting
 *    - Plastic: 1.2x (high environmental priority)
 *    - Metal: 1.5x (high recycling value)
 *    - Glass: 0.8x
 *    - Paper: 0.6x
 *    - Organic: 0.5x
 *
 * 4. Event Milestone Bonus: Rewards long-term commitment
 *    Scales dynamically with campaign duration
 *    (e.g., 2-month campaign: 10/24/50/100 events for tier bonuses)
 *
 * 5. Weight Milestone Bonus: Rewards heavy recyclers
 *    Scales dynamically with campaign duration
 *    (e.g., 2-month campaign: 10/30/70/100 kg for tier bonuses)
 *
 * Final Formula:
 * tokens = (baseReward + weightBonus × materialMultiplier) × eventBonus × weightBonus
 *
 * Example Calculation (2-month campaign):
 * User with 60 events and 120kg total recycles 1kg of plastic:
 * - Base: 1 + (1 × 3.0) × 1.2 = 4.6 tokens
 * - Event bonus (50-99 events): 1.35x
 * - Weight bonus (100-249kg): 1.15x
 * - Final: 4.6 × 1.35 × 1.15 = 7.14 tokens
 *
 * @author Carlos
 * @version 1.0
 * @since Sprint 3
 */
@Service
public class RecyclingEventService {

    @Autowired
    private RecyclingEventRepository recyclingEventRepository;

    @Autowired
    private CampaignConfig campaignConfig;

    @Autowired
    private MilestoneConfig milestoneConfig;

    @Autowired
    private MessageSource messageSource;

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

    public RecyclingEvent addRecyclingEvent(User user, Station station, Double weight,
                                            String materialType, String transactionHash) {
        // Calculate base tokens
        Double baseTokens = calculateBaseTokens(weight, materialType);

        // Get user statistics before this event
        int totalEvents = getRecyclingEventsByUser(user).size();
        Double totalWeight = getTotalWeightByUser(user);

        // Apply bonuses
        Double eventBonus = calculateEventBonus(totalEvents);
        Double weightBonus = calculateWeightBonus(totalWeight);

        // Calculate final tokens
        Double finalTokens = baseTokens * eventBonus * weightBonus;

        RecyclingEvent event = new RecyclingEvent();
        event.setUser(user);
        event.setStation(station);
        event.setWeight(weight);
        event.setMaterialType(materialType);
        event.setTokensEarned(finalTokens);
        event.setTransactionHash(transactionHash);

        return recyclingEventRepository.save(event);
    }

    public void addRecyclingEvent(RecyclingEvent event) {
        recyclingEventRepository.save(event);
    }

    /**
     * Calculate base tokens based on weight and material type
     * Base reward: 1 token for participation
     * Weight bonus: Incremental rewards for heavier items
     * Material multiplier: Different values based on recycling priority
     */
    private Double calculateBaseTokens(Double weight, String materialType) {
        double baseReward = 1.0;
        double weightBonus = 0.0;
        double materialMultiplier = 1.0;

        // Material multipliers (based on environmental priority)
        switch (materialType.toLowerCase()) {
            case "plastic": {
                materialMultiplier = 1.2;
                break;
            }
            case "glass": {
                materialMultiplier = 0.8;
                break;
            }
            case "paper": {
                materialMultiplier = 0.6;
                break;
            }
            case "metal": {
                materialMultiplier = 1.5;
                break;
            }
            case "organic": {
                materialMultiplier = 0.5;
                break;
            }
            default: {
                materialMultiplier = 1.0;
            }
        }

        // Weight-based bonus (encourages collecting before recycling)
        if (weight < 0.1) {
            // Small items (cans, bottles): 0-100g
            weightBonus = 0.5;
        } else if (weight < 1.0) {
            // Medium items: 100g-1kg
            weightBonus = weight * 2.0;
        } else if (weight < 5.0) {
            // Large items: 1kg-5kg
            weightBonus = weight * 3.0;
        } else {
            // Bulk recycling: 5kg+
            weightBonus = weight * 4.0;
        }

        return baseReward + (weightBonus * materialMultiplier);
    }

    /**
     * Calculate bonus multiplier based on total recycling events
     * Dynamically scaled based on campaign duration
     * Rewards long-term commitment without requiring daily recycling
     */
    private Double calculateEventBonus(int totalEvents) {
        int months = campaignConfig.getDuration().getMonths();

        // Scale thresholds by campaign duration
        int tier1 = milestoneConfig.getEvents().getTier1() * months;
        int tier2 = milestoneConfig.getEvents().getTier2() * months;
        int tier3 = milestoneConfig.getEvents().getTier3() * months;
        int tier4 = milestoneConfig.getEvents().getTier4() * months;

        if (totalEvents >= tier4) {
            return milestoneConfig.getEvents().getBonus().getTier4();
        }
        if (totalEvents >= tier3) {
            return milestoneConfig.getEvents().getBonus().getTier3();
        }
        if (totalEvents >= tier2) {
            return milestoneConfig.getEvents().getBonus().getTier2();
        }
        if (totalEvents >= tier1) {
            return milestoneConfig.getEvents().getBonus().getTier1();
        }
        return 1.0;
    }

    /**
     * Calculate bonus multiplier based on total weight recycled
     * Dynamically scaled based on campaign duration
     * Rewards users who accumulate and recycle larger quantities
     */
    private Double calculateWeightBonus(Double totalWeight) {
        int months = campaignConfig.getDuration().getMonths();

        // Scale thresholds by campaign duration
        double tier1 = milestoneConfig.getWeight().getTier1() * months;
        double tier2 = milestoneConfig.getWeight().getTier2() * months;
        double tier3 = milestoneConfig.getWeight().getTier3() * months;
        double tier4 = milestoneConfig.getWeight().getTier4() * months;

        if (totalWeight >= tier4) {
            return milestoneConfig.getWeight().getBonus().getTier4();
        }
        if (totalWeight >= tier3) {
            return milestoneConfig.getWeight().getBonus().getTier3();
        }
        if (totalWeight >= tier2) {
            return milestoneConfig.getWeight().getBonus().getTier2();
        }
        if (totalWeight >= tier1) {
            return milestoneConfig.getWeight().getBonus().getTier1();
        }
        return 1.0;
    }

    /**
     * Get total weight recycled by user
     */
    private Double getTotalWeightByUser(User user) {
        List<RecyclingEvent> events = getRecyclingEventsByUser(user);
        return events.stream()
                .mapToDouble(RecyclingEvent::getWeight)
                .sum();
    }

    /**
     * Get comprehensive user statistics for achievement tracking
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

        return new UserStats(totalEvents, totalWeight, totalTokens,
                calculateEventBonus(totalEvents),
                calculateWeightBonus(totalWeight));
    }

    /**
     * Get user achievement tier based on number of events
     * Returns internationalized tier name
     */
    public String getEventTier(int events) {
        int months = campaignConfig.getDuration().getMonths();
        Locale locale = LocaleContextHolder.getLocale();

        if (events >= milestoneConfig.getEvents().getTier4() * months) {
            return messageSource.getMessage("achievement.event.tier4", null, locale);
        }
        if (events >= milestoneConfig.getEvents().getTier3() * months) {
            return messageSource.getMessage("achievement.event.tier3", null, locale);
        }
        if (events >= milestoneConfig.getEvents().getTier2() * months) {
            return messageSource.getMessage("achievement.event.tier2", null, locale);
        }
        if (events >= milestoneConfig.getEvents().getTier1() * months) {
            return messageSource.getMessage("achievement.event.tier1", null, locale);
        }
        return messageSource.getMessage("achievement.event.tier0", null, locale);
    }

    /**
     * Get user achievement tier based on total weight recycled
     * Returns internationalized tier name
     */
    public String getWeightTier(Double weight) {
        int months = campaignConfig.getDuration().getMonths();
        Locale locale = LocaleContextHolder.getLocale();

        if (weight >= milestoneConfig.getWeight().getTier4() * months) {
            return messageSource.getMessage("achievement.weight.tier4", null, locale);
        }
        if (weight >= milestoneConfig.getWeight().getTier3() * months) {
            return messageSource.getMessage("achievement.weight.tier3", null, locale);
        }
        if (weight >= milestoneConfig.getWeight().getTier2() * months) {
            return messageSource.getMessage("achievement.weight.tier2", null, locale);
        }
        if (weight >= milestoneConfig.getWeight().getTier1() * months) {
            return messageSource.getMessage("achievement.weight.tier1", null, locale);
        }
        return messageSource.getMessage("achievement.weight.tier0", null, locale);
    }

    /**
     * Inner class for user statistics
     * Contains all relevant metrics for displaying user progress and achievements
     */
    public record UserStats(int totalEvents, Double totalWeight, Double totalTokens,
                            Double currentEventBonus, Double currentWeightBonus) {
    }
}