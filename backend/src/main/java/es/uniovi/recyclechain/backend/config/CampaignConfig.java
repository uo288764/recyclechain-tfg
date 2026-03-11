package es.uniovi.recyclechain.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Campaign Configuration
 *
 * Manages the campaign duration settings for the RecycleChain gamification system.
 * This allows easy modification of campaign length without code changes.
 *
 * The campaign duration is used to dynamically scale milestone thresholds,
 * ensuring that targets remain achievable regardless of campaign length.
 *
 * Configuration properties are loaded from application.properties with prefix "campaign".
 *
 * Example: For a 2-month campaign, event milestones are multiplied by 2.
 * If base tier1 = 5 events/month, the actual threshold becomes 10 events total.
 *
 * @author Carlos
 * @version 1.0
 * @since Sprint 3
 */
@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "campaign")
public class CampaignConfig {

    private Duration duration = new Duration();

    public static class Duration {
        private int months = 2;

        public int getMonths() {
            return months;
        }

        public void setMonths(int months) {
            this.months = months;
        }
    }
}