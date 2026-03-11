package es.uniovi.recyclechain.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Milestone Configuration
 *
 * Defines configurable milestones and bonus multipliers for the RecycleChain
 * gamification system. Milestones are categorized into two types:
 *
 * 1. Event-based milestones: Rewards based on number of recycling events
 * 2. Weight-based milestones: Rewards based on total kilograms recycled
 *
 * Each milestone tier has:
 * - A threshold value (events or kg per month)
 * - A bonus multiplier applied to token earnings
 *
 * Thresholds are defined per month and automatically scaled by campaign duration.
 * This ensures fair and achievable targets for campaigns of any length.
 *
 * Configuration properties are loaded from application.properties with prefix "milestone".
 *
 * Default configuration (per month):
 * - Events: 5/12/25/50 events → 1.1x/1.2x/1.35x/1.5x bonuses
 * - Weight: 5/15/35/75 kg → 1.05x/1.1x/1.15x/1.25x bonuses
 *
 * @author Carlos
 * @version 1.0
 * @since Sprint 3
 */
@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "milestone")
public class MilestoneConfig {

    private Events events = new Events();
    private Weight weight = new Weight();

    @Setter
    @Getter
    public static class Events {
        private int tier1 = 5;
        private int tier2 = 12;
        private int tier3 = 25;
        private int tier4 = 50;

        private Bonus bonus = new Bonus();

        @Setter
        @Getter
        public static class Bonus {
            private double tier1 = 1.1;
            private double tier2 = 1.2;
            private double tier3 = 1.35;
            private double tier4 = 1.5;

        }
    }

    @Setter
    @Getter
    public static class Weight {
        private double tier1 = 5.0;
        private double tier2 = 15.0;
        private double tier3 = 35.0;
        private double tier4 = 50.0;

        private Bonus bonus = new Bonus();

        @Setter
        @Getter
        public static class Bonus {
            private double tier1 = 1.05;
            private double tier2 = 1.1;
            private double tier3 = 1.15;
            private double tier4 = 1.25;

        }
    }
}