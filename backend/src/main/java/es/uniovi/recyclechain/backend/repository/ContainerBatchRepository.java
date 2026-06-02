package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.ContainerBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContainerBatchRepository extends JpaRepository<ContainerBatch, Long> {

    /**
     * Returns all batches belonging to a given campaign.
     */
    List<ContainerBatch> findByCampaignId(Long campaignId);
}