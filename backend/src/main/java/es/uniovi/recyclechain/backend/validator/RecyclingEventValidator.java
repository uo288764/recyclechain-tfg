package es.uniovi.recyclechain.backend.validator;

import es.uniovi.recyclechain.backend.dto.RecyclingEventRequest;
import es.uniovi.recyclechain.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.Set;

@Component
public class RecyclingEventValidator implements Validator {

    private static final Set<String> VALID_MATERIALS =
            Set.of("plastic", "glass", "paper", "metal", "organic");

    private static final double MAX_MANUAL_WEIGHT_KG = 100.0;

    @Autowired
    private StationService stationService;

    @Override
    public boolean supports(Class<?> clazz) {
        return RecyclingEventRequest.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        RecyclingEventRequest request = (RecyclingEventRequest) target;

        // Validate that the station exists and is active
        if (request.getStationId() != null) {
            var station = stationService.getStation(request.getStationId());
            if (station == null) {
                errors.rejectValue("stationId",
                        "Error.recyclingEvent.station.notFound");
            } else if (!station.getIsActive()) {
                errors.rejectValue("stationId",
                        "Error.recyclingEvent.station.inactive");
            }
        }

        if (request.getContainerId() != null) {
            // Container flow: weight and material come from ContainerBatch.
            // Manual weight and materialType fields must not be provided —
            // accepting them would open a surface for parameter confusion.
            if (request.getWeight() != null) {
                errors.rejectValue("weight",
                        "Error.recyclingEvent.weight.notAllowedWithContainer");
            }
            if (request.getMaterialType() != null) {
                errors.rejectValue("materialType",
                        "Error.recyclingEvent.materialType.notAllowedWithContainer");
            }
        } else {
            // Manual flow: weight and materialType are required
            if (request.getWeight() == null) {
                errors.rejectValue("weight",
                        "Error.recyclingEvent.weight.required");
            } else if (request.getWeight() > MAX_MANUAL_WEIGHT_KG) {
                errors.rejectValue("weight",
                        "Error.recyclingEvent.weight.tooHigh");
            }

            if (request.getMaterialType() == null || request.getMaterialType().isBlank()) {
                errors.rejectValue("materialType",
                        "Error.recyclingEvent.materialType.required");
            } else if (!VALID_MATERIALS.contains(
                    request.getMaterialType().toLowerCase())) {
                errors.rejectValue("materialType",
                        "Error.recyclingEvent.materialType.invalid");
            }
        }
    }
}