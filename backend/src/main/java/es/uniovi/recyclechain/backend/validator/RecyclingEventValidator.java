package es.uniovi.recyclechain.backend.validator;

import es.uniovi.recyclechain.backend.dto.RecyclingEventRequest;
import es.uniovi.recyclechain.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

@Component
public class RecyclingEventValidator implements Validator {

    @Autowired
    private StationService stationService;

    @Override
    public boolean supports(Class<?> clazz) {
        return RecyclingEventRequest.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        RecyclingEventRequest request = (RecyclingEventRequest) target;

        // Validate that the station is present and active
        if (request.getStationId() != null) {
            var station = stationService.getStation(request.getStationId());
            if (station == null) {
                errors.rejectValue("stationId", "Error.recyclingEvent.station.notFound");
            } else if (!station.getIsActive()) {
                errors.rejectValue("stationId", "Error.recyclingEvent.station.inactive");
            }
        }

        // Validate that the weight is reasonable (max 100kgs per event)
        if (request.getWeight() != null && request.getWeight() > 100.0) {
            errors.rejectValue("weight", "Error.recyclingEvent.weight.tooHigh");
        }

        // Validate the material type
        if (request.getMaterialType() != null) {
            String materialType = request.getMaterialType().toLowerCase();
            if (!materialType.equals("plastic") && 
                !materialType.equals("glass") && 
                !materialType.equals("paper") && 
                !materialType.equals("metal")) {
                errors.rejectValue("materialType", "Error.recyclingEvent.materialType.invalid");
            }
        }
    }
}