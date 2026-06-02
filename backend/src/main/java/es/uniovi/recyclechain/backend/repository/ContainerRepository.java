package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.Container;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContainerRepository extends JpaRepository<Container, Long> {

    Optional<Container> findByUuid(String uuid);

    /**
     * Returns all containers in SCANNED state for a given user.
     * Used to populate the "My Pending Containers" list on the frontend.
     */
    List<Container> findByUserIdAndStatus(Long userId, Container.ContainerStatus status);
}