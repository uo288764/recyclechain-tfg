package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    /**
     * Returns the single active campaign, if any exists.
     * Used to enforce the one-active-campaign constraint and to
     * resolve the active campaign when registering recycling events.
     */
    Optional<Campaign> findByStatus(Campaign.Status status);

    /**
     * Returns true if any campaign with the given status exists.
     * Used to block activation when another ACTIVE campaign exists.
     */
    boolean existsByStatus(Campaign.Status status);
}