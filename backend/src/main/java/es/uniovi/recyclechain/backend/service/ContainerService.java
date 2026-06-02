package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.model.Campaign;
import es.uniovi.recyclechain.backend.model.Container;
import es.uniovi.recyclechain.backend.model.ContainerBatch;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.repository.CampaignRepository;
import es.uniovi.recyclechain.backend.repository.ContainerBatchRepository;
import es.uniovi.recyclechain.backend.repository.ContainerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Container Service
 *
 * Manages ContainerBatch creation, Container generation, and the
 * dual QR scan flow: UNSCANNED → SCANNED → DEPOSITED.
 */
@Service
public class ContainerService {

    @Autowired
    private ContainerRepository containerRepository;

    @Autowired
    private ContainerBatchRepository containerBatchRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    /**
     * Creates a ContainerBatch and generates N individual Container records,
     * each with a unique UUID for printing as a QR code.
     *
     * The associated campaign must exist and must not be CLOSED.
     * Batches can be created against DRAFT or ACTIVE campaigns to allow
     * preparation before campaign launch.
     */
    public ContainerBatch createBatch(ContainerBatch batch) {
        Campaign campaign = campaignRepository.findById(batch.getCampaign().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Campaign not found"));

        if (campaign.getStatus() == Campaign.Status.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Cannot create batches for a closed campaign");
        }

        batch.setCampaign(campaign);

        // Generate N Container records from the batch
        List<Container> containers = new ArrayList<>();
        for (int i = 0; i < batch.getUnitCount(); i++) {
            Container container = new Container();
            container.setBatch(batch);
            containers.add(container);
        }
        batch.setContainers(containers);

        return containerBatchRepository.save(batch);
    }

    public List<ContainerBatch> getBatchesByCampaign(Long campaignId) {
        return containerBatchRepository.findByCampaignId(campaignId);
    }

    public ContainerBatch getBatch(Long id) {
        return containerBatchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "ContainerBatch not found: " + id));
    }

    /**
     * Step 1 of the dual QR flow: user scans the container QR at home.
     *
     * Resolves the UUID to a Container, validates that it is UNSCANNED,
     * and transitions it to SCANNED, linking it to the user's account.
     * The container then appears in the user's pending containers list.
     *
     * Throws 404 if UUID is unknown, 409 if already scanned or deposited.
     */
    public Container scanContainer(String uuid, User user) {
        Container container = containerRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Container not found"));

        if (container.getStatus() != Container.ContainerStatus.UNSCANNED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Container has already been scanned or deposited");
        }

        container.setStatus(Container.ContainerStatus.SCANNED);
        container.setUser(user);
        container.setScannedAt(LocalDateTime.now());
        return containerRepository.save(container);
    }

    /**
     * Step 2 of the dual QR flow: confirms physical deposit at a recycling station.
     *
     * Validates that the container belongs to the requesting user and is in
     * SCANNED state. Transitions to DEPOSITED and records the timestamp.
     * Token issuance is handled by RecyclingEventService after this call.
     *
     * Throws 403 if the container does not belong to the requesting user.
     * Throws 409 if the container is not in SCANNED state.
     */
    public Container depositContainer(Long containerId, User user) {
        Container container = containerRepository.findById(containerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Container not found"));

        if (!container.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Container does not belong to this user");
        }

        if (container.getStatus() != Container.ContainerStatus.SCANNED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Container must be in SCANNED state to deposit");
        }

        container.setStatus(Container.ContainerStatus.DEPOSITED);
        container.setDepositedAt(LocalDateTime.now());
        return containerRepository.save(container);
    }

    /**
     * Returns all containers in SCANNED state for a given user.
     * These are containers the user has registered but not yet deposited.
     */
    public List<Container> getPendingContainers(Long userId) {
        return containerRepository.findByUserIdAndStatus(
                userId, Container.ContainerStatus.SCANNED);
    }
}