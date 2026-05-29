package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.UsedQRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsedQRCodeRepository extends JpaRepository<UsedQRCode, Long> {

    boolean existsByPayload(String payload);
}