# DIRS: Dependent infrastructure resilience

## Dependent infrastructure resilience defined

The invisible dependency layer — external infrastructure that datasets depend on but don’t control: calibration facilities, satellite ground stations, field observation networks, specialized instrumentation labs. When NOAA’s Global Monitoring Laboratory calibration services were threatened, every dataset whose quality assurance depends on those standards became more fragile immediately, regardless of its own hosting situation.

## Subcategories

### DIRS-1

#### Description

Calibration facility dependency

Dataset quality or continuity depends on an external calibration service, reference standard lab, or inter-comparison program that could be disrupted

#### How to find

Find out who performs the data processing and does quality control (QC) on it. Is the data processing done by the group making the measurements or by an outside group?

### DIRS-2

#### Description

Observation network or sensor platform at risk

Upstream sensors, ground stations, buoys, or satellite instruments that feed this dataset are aging out, losing funding, or operating past design life

#### How to find

Find out how data measurements are taken and what instruments and platforms are needed. For datasets that depend on other datasets, this is important to know if the included datasets have near future unavailability. Could be a satellite coming to the end of use or funding cuts for use of a satellite or funding cuts so that the instruments or platforms needed to measure the data will be interrupted.

### DIRS-3

#### Description

Upstream data supply chain at risk

Dataset depends on external data feeds (reanalysis inputs, ancillary fields, reference datasets) that are themselves vulnerable to disruption

#### How to find

Find all external datasets that are used as part of the dataset or used to process the dataset. Is it a stand alone measurement or does it depend on other datasets outside of the program or group serving the dataset. Want to know what the dataset depends on and if those dependencies are in danger of not being available or have their availability interrupted.

### DIRS-4

#### Description

External processing infrastructure dependency

Specialized computing, software, or lab facilities not controlled by the data steward are required to produce or update this dataset

#### How to find

Look at how the dataset is processed and if any outside groups are involved with the dataset processing. Also look for instruments needed to make the measurements but outside of the groups resources. e.g. the use of satellites to get data. Is the data processing complex and specialized resources and outside groups and facilities are needed? Is the software and code produced by the group taking the measurements or is it proprietary or comes from outside groups?

### DIRS-5

#### Description

No alternative supplier

If the primary external dependency fails, no backup source, workaround, or substitute exists to maintain data quality or continuity

#### How to find

Check the dependencies of the data. Datasets may depend on satellite data for example and if the satellite funding is in danger or the satellite is at the end of life with no replacement, that's important information to have.
