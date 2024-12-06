## Midpoint Codebase

Midpoint Output 123

### File Structure

- midpoint/
  - .gitlab-ci.yml
  - .mvn/
    - settings.xml
  - aws/
    - pom.xml
  - bin/
    - run-local-env.sh
    - summarize-stats.py
  - database/
    - 4.8.0/
      - postgres-new-audit.sql
      - postgres-new-quartz.sql
      - postgres-new.sql
    - postgres-audit-upgrade.sql
    - postgres-upgrade.sql
  - doc/
  - docker/
    - pom.xml
    - src/
      - main/
        - docker/
          - files/
            - mp-bin/
              - env-dev.sh
              - env-local.sh
              - env-pprd.sh
              - env-prod.sh
              - jvm-stats.sh
              - prepare-upgrade.sh
              - setenv.sh
              - upgrade-database.sh
              - vault.sh
            - mp-var/
              - application.yml
              - config.xml
              - connid-connectors/
              - lib/
              - logback.xml
              - post-initial-objects/
                - archetypes/
                  - 300-archetype-ad-security-group.xml
                  - 300-archetype-approver-of-requestable-role.xml
                  - 300-archetype-grouper-group.xml
                  - 300-archetype-requestable-role.xml
                - object-templates/
                  - 015-object-template-user.xml
                  - 100-object-template-role.xml
                - resources/
                  - 100-inbound-grouper-groups.xml
                  - 100-inbound-users-ad-ldap.xml
                  - 100-inbound-users-ed-id-ldap.xml
                  - 100-outbound-ad-security-groups.xml
                  - 100-outbound-grouper-requests-scripted-sql.xml
                - roles/
                  - 200-ad-user-role.xml
                  - 200-grouper-group-metarole.xml
                  - 200-gui-grouper-group-requester-role.xml
                  - 200-gui-role-approver.xml
                - security-policy/
                  - 009-global-password-policy.xml
                  - 010-security-policy.xml
                - system-configuration/
                  - 000-system-configuration.xml
                - tasks/
                  - resource-tasks/
                    - ed-id/
                      - 995-task-ed-id-users-livesync.xml
                      - 995-task-ed-id-users-reconciliation.xml
                    - midpoint-ad/
                      - 995-task-ad-security-user-import.xml
                    - midpoint-grouper-integration/
                      - 995-task-grouper-groups-recon.xml
                      - 995-task-grouper-members-recon.xml
                      - 995-task-inbound-grouper-groups-livesync.xml
                  - utility-tasks/
                    - 995-task-restart-suspended-tasks.xml
                    - 995-task-user-recompute.xml
                    - 995-task-user-reindex.xml
                - user/
                  - 050-user-administrator.xml
              - schema/
              - sql-scripts/
                - mp-to-grouper/
                  - common/
                - postgres-audit-upgrade.sql
                - postgres-upgrade.sql
              - static-web/
        - resources/
  - local-env/
    - scripts/
      - generateUsers.py
      - update-sql-scripts.sh
    - src/
      - test/
        - docker/
          - compose.yaml
          - data/
            - db/
              - gr_to_mp_app/
              - midpoint_app/
              - mp_to_gr_app/
          - database/
            - scripts/
              - 01-init.sql
              - 02-midpoint.sql
              - 03-audit.sql
              - 04-quartz.sql
          - edldap/
            - certs/
            - data/
          - midpoint/
            - certs/
          - registry/
            - scripts/
              - 10-persons.sql
              - 20-midPoint-service.sql
          - test-driver/
            - 01-provisioner-test.py
            - pylib/
              - __init__.py
              - ed.py
              - grouper.py
              - test.py
            - run-tests.sh
          - vault/
            - bin/
              - run.sh
            - credentials/
            - etc/
              - create-midPoint-jwt.py
              - create-midPoint-jwt.sh
              - gen-registry-cert-encoded-value.sh
  - pom.xml


### Combined Files

## /Users/ddonahoe/code/midpoint/.gitlab-ci.yml

```typescript
include:
  - project: 'middleware/pipelines'
    ref: v1.8
    file: 'gitlab-ci-application-common.yml'

variables:
  BUILD_IMAGE: "maven:3.9-amazoncorretto-17"
  DEV_URL: "https://dev.midpoint.it.vt.edu"
  PPRD_URL: "https://pprd.midpoint.it.vt.edu"
  PROD_URL: "https://midpoint.it.vt.edu"
  MODULE: "midpoint"
  AWS_ROLE_ARN: "arn:aws:iam::711074623774:role/CFN"
  DISABLE_DOCKER_BUILD_IMAGE_CHECK: "true"
  PIPELINES_REF: "v1.8"
  DOCKER_REPO_IDS: "464"
  MAVEN_FORCE_UPDATE: "true"

get-previous-midpoint-version:
  stage: prepare
  image:
    name: alpine/git:latest
    entrypoint: [""]
  artifacts:
    when: always
    expire_in: 1 mo
    paths:
      - docker/target/*
  variables:
    SRC_FILE: docker/src/main/docker/files/mp-var/midpoint-version.txt
    DST_FILE: docker/target/files/mp-var/midpoint-version.old
  tags:
    - docker-runner
  script:
    - mkdir -p docker/target/files/mp-var
    - if [ -z "$(git ls-tree -r HEAD~1 --name-only $SRC_FILE)" ]; then
       touch $DST_FILE;
       else git cat-file -p HEAD~1:$SRC_FILE > $DST_FILE; fi
    - cat $DST_FILE

stages:
  - prepare
  - build
  - publish
  - deploy
  - cleanup
  - system-test

```

## /Users/ddonahoe/code/midpoint/.mvn/settings.xml

```typescript
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 http://maven.apache.org/xsd/settings-1.2.0.xsd">
  <servers>
    <server>
      <id>gitlab-maven</id>
      <configuration>
        <httpHeaders>
          <property>
            <name>Private-Token</name>
            <value>${env.GITLAB_ACCESS_TOKEN}</value>
          </property>
        </httpHeaders>
      </configuration>
    </server>
    <server>
      <id>gitlab-maven-pipeline</id>
      <configuration>
        <httpHeaders>
          <property>
            <name>Job-Token</name>
            <value>${env.CI_JOB_TOKEN}</value>
          </property>
        </httpHeaders>
      </configuration>
    </server>
  </servers>
</settings>

```

## /Users/ddonahoe/code/midpoint/aws/pom.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>edu.vt</groupId>
    <artifactId>midpoint</artifactId>
    <version>4.8.5.2-SNAPSHOT</version>
  </parent>

  <artifactId>midpoint-aws</artifactId>

  <dependencies>
    <dependency>
      <groupId>edu.vt.middleware</groupId>
      <artifactId>mw-spring-boot-core</artifactId>
      <version>${mw-spring-boot-core.version}</version>
    </dependency>
  </dependencies>

  <properties>
    <aws.env.CreationDate>${maven.build.timestamp}</aws.env.CreationDate>
    <aws.env.YourKitProfilerEnabled>false</aws.env.YourKitProfilerEnabled>
    <aws.Listener-Rules></aws.Listener-Rules>
  </properties>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <executions>
          <execution>
            <id>copy-awsfiles</id>
            <phase>package</phase>
            <goals>
              <goal>unpack</goal>
            </goals>
            <configuration>
              <artifactItems>
                <artifactItem>
                  <groupId>edu.vt.middleware</groupId>
                  <artifactId>mw-spring-boot-core</artifactId>
                  <type>jar</type>
                  <overWrite>true</overWrite>
                  <includes>META-INF/aws/**</includes>
                  <outputDirectory>${project.build.directory}/orig</outputDirectory>
                  <fileMappers>
                    <org.codehaus.plexus.components.io.filemappers.RegExpFileMapper>
                      <pattern>^(.*)/(.*)\.json$</pattern>
                      <replacement>${project.parent.artifactId}-$2.json</replacement>
                    </org.codehaus.plexus.components.io.filemappers.RegExpFileMapper>
                  </fileMappers>
                </artifactItem>
              </artifactItems>
            </configuration>
          </execution>
        </executions>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-resources-plugin</artifactId>
        <executions>
          <execution>
            <id>filter-aws-properties</id>
            <phase>package</phase>
            <goals>
              <goal>copy-resources</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}</outputDirectory>
              <filters>
                <filter>aws.properties</filter>
              </filters>
              <resources>
                <resource>
                  <directory>${project.build.directory}/orig</directory>
                  <filtering>true</filtering>
                  <includes>
                    <include>${project.parent.artifactId}-*.json</include>
                  </includes>
                </resource>
              </resources>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

  <profiles>
    <profile>
      <id>yourkit-property-defined</id>
      <activation>
        <property>
          <name>env.YOUR_KIT_PROFILER_ENABLED</name>
        </property>
      </activation>
      <properties>
        <aws.env.YourKitProfilerEnabled>${env.YOUR_KIT_PROFILER_ENABLED}</aws.env.YourKitProfilerEnabled>
      </properties>
    </profile>
  </profiles>
</project>

```

## /Users/ddonahoe/code/midpoint/bin/run-local-env.sh

```typescript
#!/usr/bin/env bash

CTX_DIR="local-env/target"
if [ -e $CTX_DIR ]; then
  rm -fR $CTX_DIR
fi
mkdir $CTX_DIR
cp -R local-env/src/test/docker/* $CTX_DIR
export OIDC_CLIENT_SECRET="not-used-in-local-env"
COMPOSE_FILE=$CTX_DIR/compose.yaml
docker compose -f $COMPOSE_FILE down && \
  docker network prune -f && \
  docker compose -f $COMPOSE_FILE pull && \
  docker compose -f $COMPOSE_FILE up --build --abort-on-container-exit


```

## /Users/ddonahoe/code/midpoint/bin/summarize-stats.py

```typescript
#!/usr/bin/env python3
#
# Processes all entries of a log file that contain output from the MidPoint statistics logger,
# com.evolveum.midpoint.repo.common.activity.run.StatisticsLogger, containing statistics about sync tasks
# and reports some useful statistics from the data set.

import re
import sys
from datetime import datetime
from os.path import basename
from statistics import linear_regression, mean, stdev

DATE_FORMAT = '%Y-%m-%dT%H:%M:%S.%f%z'
STATS_REGEX = re.compile(r'done with status SUCCESS in ([0-9.,]+) ms')

if len(sys.argv) < 2:
    print('USAGE:', basename(sys.argv[0]), 'path/to/stats.log')
    sys.exit(0)
timestamps = []
stats = []
with open(sys.argv[1], 'r') as file:
    line = file.readline()
    while line:
        timestamps.append(datetime.strptime(line.split(' ')[0], DATE_FORMAT))
        match = STATS_REGEX.search(line)
        if match:
            stats.append(float(match.group(1).replace(',', '')))
        line = file.readline()
timestamps_as_floats = list(map(lambda d: d.timestamp(), timestamps))
slope, intercept = linear_regression(timestamps_as_floats, stats)
print('')
print('Latency Report (ms/item)')
print('------------------------')
print('\tItems processed:', len(stats))
print('\tWall time:', timestamps[-1] - timestamps[0])
print('\tAverage:', mean(stats), 'ms')
print('\tStandard Deviation:', stdev(stats), 'ms')
print('\tSlope:', slope, 'ms')

```

## /Users/ddonahoe/code/midpoint/database/4.8.0/postgres-new-audit.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- USAGE NOTES: You can apply this to the main repository schema.
-- For separate audit use this in a separate database.
-- See the docs here: https://docs.evolveum.com/midpoint/reference/repository/native-audit
--
-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- Naming conventions:
-- M_ prefix is used for tables in main part of the repo, MA_ for audit tables (can be separate)
-- Constraints/indexes use table_column(s)_suffix convention, with PK for primary key,
-- FK foreign key, IDX for index, KEY for unique index.
-- TR is suffix for triggers.
-- Names are generally lowercase (despite prefix/suffixes above in uppercase ;-)).
-- Column names are Java style and match attribute names from M-classes (e.g. MAuditEvent).
--
-- Other notes:
-- TEXT is used instead of VARCHAR, see: https://dba.stackexchange.com/a/21496/157622

-- noinspection SqlResolveForFile @ operator-class/"gin__int_ops"

-- just in case PUBLIC schema was dropped (fastest way to remove all midpoint objects)
-- drop schema public cascade;
CREATE SCHEMA IF NOT EXISTS public;
-- CREATE EXTENSION IF NOT EXISTS pg_trgm; -- support for trigram indexes

-- region custom enum types
DO $$ BEGIN
    -- NOTE: Types in this block must be updated when changed in postgres-new.sql!
    CREATE TYPE ObjectType AS ENUM (
        'ABSTRACT_ROLE',
        'ACCESS_CERTIFICATION_CAMPAIGN',
        'ACCESS_CERTIFICATION_DEFINITION',
        'ARCHETYPE',
        'ASSIGNMENT_HOLDER',
        'CASE',
        'CONNECTOR',
        'CONNECTOR_HOST',
        'DASHBOARD',
        'FOCUS',
        'FORM',
        'FUNCTION_LIBRARY',
        'GENERIC_OBJECT',
        'LOOKUP_TABLE',
        'MARK',
        'MESSAGE_TEMPLATE',
        'NODE',
        'OBJECT',
        'OBJECT_COLLECTION',
        'OBJECT_TEMPLATE',
        'ORG',
        'REPORT',
        'REPORT_DATA',
        'RESOURCE',
        'ROLE',
        'ROLE_ANALYSIS_CLUSTER',
        'ROLE_ANALYSIS_SESSION',
        'SECURITY_POLICY',
        'SEQUENCE',
        'SERVICE',
        'SHADOW',
        'SIMULATION_RESULT',
        'SYSTEM_CONFIGURATION',
        'TASK',
        'USER',
        'VALUE_POLICY');

    CREATE TYPE OperationResultStatusType AS ENUM ('SUCCESS', 'WARNING', 'PARTIAL_ERROR',
        'FATAL_ERROR', 'HANDLED_ERROR', 'NOT_APPLICABLE', 'IN_PROGRESS', 'UNKNOWN');
EXCEPTION WHEN duplicate_object THEN raise notice 'Main repo custom types already exist, OK...'; END $$;

CREATE TYPE AuditEventTypeType AS ENUM ('GET_OBJECT', 'ADD_OBJECT', 'MODIFY_OBJECT',
    'DELETE_OBJECT', 'EXECUTE_CHANGES_RAW', 'SYNCHRONIZATION', 'CREATE_SESSION',
    'TERMINATE_SESSION', 'WORK_ITEM', 'WORKFLOW_PROCESS_INSTANCE', 'RECONCILIATION',
    'SUSPEND_TASK', 'RESUME_TASK', 'RUN_TASK_IMMEDIATELY', 'DISCOVER_OBJECT', 'INFORMATION_DISCLOSURE');

CREATE TYPE AuditEventStageType AS ENUM ('REQUEST', 'EXECUTION', 'RESOURCE');

CREATE TYPE EffectivePrivilegesModificationType AS ENUM ('ELEVATION', 'FULL_ELEVATION', 'REDUCTION', 'OTHER');

CREATE TYPE ChangeType AS ENUM ('ADD', 'MODIFY', 'DELETE');



   -- We try to create ShadowKindType (necessary if audit is in separate database, if it is in same
   -- database as repository, type already exists.
DO $$ BEGIN
       CREATE TYPE ShadowKindType AS ENUM ('ACCOUNT', 'ENTITLEMENT', 'GENERIC', 'UNKNOWN');
   EXCEPTION
       WHEN duplicate_object THEN null;
END $$;
-- endregion

-- region management tables
-- Key -> value config table for internal use.
CREATE TABLE IF NOT EXISTS m_global_metadata (
    name TEXT PRIMARY KEY,
    value TEXT
);
-- endregion

-- region AUDIT
CREATE TABLE ma_audit_event (
    -- ID is generated as unique, but if provided, it is checked for uniqueness
    -- only in combination with timestamp because of partitioning.
    id BIGSERIAL NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    eventIdentifier TEXT,
    eventType AuditEventTypeType,
    eventStage AuditEventStageType,
    sessionIdentifier TEXT,
    requestIdentifier TEXT,
    taskIdentifier TEXT,
    taskOid UUID,
    hostIdentifier TEXT,
    nodeIdentifier TEXT,
    remoteHostAddress TEXT,
    initiatorOid UUID,
    initiatorType ObjectType,
    initiatorName TEXT,
    attorneyOid UUID,
    attorneyName TEXT,
    effectivePrincipalOid UUID,
    effectivePrincipalType ObjectType,
    effectivePrincipalName TEXT,
    effectivePrivilegesModification EffectivePrivilegesModificationType,
    targetOid UUID,
    targetType ObjectType,
    targetName TEXT,
    targetOwnerOid UUID,
    targetOwnerType ObjectType,
    targetOwnerName TEXT,
    channel TEXT, -- full URI, we do not want m_uri ID anymore
    outcome OperationResultStatusType,
    parameter TEXT,
    result TEXT,
    message TEXT,
    changedItemPaths TEXT[],
    resourceOids TEXT[],
    properties JSONB,
    -- ext JSONB, -- TODO extension container later

    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

CREATE INDEX ma_audit_event_timestamp_idx ON ma_audit_event (timestamp);
CREATE INDEX ma_audit_event_eventIdentifier_idx ON ma_audit_event (eventIdentifier);
CREATE INDEX ma_audit_event_sessionIdentifier_idx ON ma_audit_event (sessionIdentifier);
CREATE INDEX ma_audit_event_requestIdentifier_idx ON ma_audit_event (requestIdentifier);
-- This was originally eventStage + targetOid, but low variability eventStage can do more harm.
CREATE INDEX ma_audit_event_targetOid_idx ON ma_audit_event (targetOid);
-- TODO do we want to index every single column or leave the rest to full/partial scans?
-- Original repo/audit didn't have any more indexes either...
CREATE INDEX ma_audit_event_changedItemPaths_idx ON ma_audit_event USING gin(changeditempaths);
CREATE INDEX ma_audit_event_resourceOids_idx ON ma_audit_event USING gin(resourceOids);
CREATE INDEX ma_audit_event_properties_idx ON ma_audit_event USING gin(properties);
-- TODO trigram indexes for LIKE support? What columns? message, ...

CREATE TABLE ma_audit_delta (
    recordId BIGINT NOT NULL, -- references ma_audit_event.id
    timestamp TIMESTAMPTZ NOT NULL, -- references ma_audit_event.timestamp
    checksum TEXT NOT NULL,
    delta BYTEA,
    deltaOid UUID,
    deltaType ChangeType,
    fullResult BYTEA,
    objectNameNorm TEXT,
    objectNameOrig TEXT,
    resourceOid UUID,
    resourceNameNorm TEXT,
    resourceNameOrig TEXT,
    shadowKind ShadowKindType,
    shadowIntent TEXT,
    status OperationResultStatusType,

    PRIMARY KEY (recordId, timestamp, checksum)
) PARTITION BY RANGE (timestamp);

/* Similar FK is created PER PARTITION only, see audit_create_monthly_partitions
   or *_default tables:
ALTER TABLE ma_audit_delta ADD CONSTRAINT ma_audit_delta_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event (id, timestamp)
        ON DELETE CASCADE;

-- Primary key covers the need for FK(recordId, timestamp) as well, no need for explicit index.
*/

-- TODO: any unique combination within single recordId? name+oid+type perhaps?
CREATE TABLE ma_audit_ref (
    id BIGSERIAL NOT NULL, -- unique technical PK
    recordId BIGINT NOT NULL, -- references ma_audit_event.id
    timestamp TIMESTAMPTZ NOT NULL, -- references ma_audit_event.timestamp
    name TEXT, -- multiple refs can have the same name, conceptually it's a Map(name -> refs[])
    targetOid UUID,
    targetType ObjectType,
    targetNameOrig TEXT,
    targetNameNorm TEXT,

    PRIMARY KEY (id, timestamp) -- real PK must contain partition key (timestamp)
) PARTITION BY RANGE (timestamp);

/* Similar FK is created PER PARTITION only:
ALTER TABLE ma_audit_ref ADD CONSTRAINT ma_audit_ref_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event (id, timestamp)
        ON DELETE CASCADE;
*/
-- Index for FK mentioned above.
-- Index can be declared for partitioned table and will be partitioned automatically.
CREATE INDEX ma_audit_ref_recordId_timestamp_idx ON ma_audit_ref (recordId, timestamp);

-- Default tables used when no timestamp range partitions are created:
CREATE TABLE ma_audit_event_default PARTITION OF ma_audit_event DEFAULT;
CREATE TABLE ma_audit_delta_default PARTITION OF ma_audit_delta DEFAULT;
CREATE TABLE ma_audit_ref_default PARTITION OF ma_audit_ref DEFAULT;

/*
For info about what is and is not automatically created on the partition, see:
https://www.postgresql.org/docs/13/sql-createtable.html (search for "PARTITION OF parent_table")
In short, for our case PK and constraints are created automatically, but FK are not.
*/
ALTER TABLE ma_audit_delta_default ADD CONSTRAINT ma_audit_delta_default_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event_default (id, timestamp)
        ON DELETE CASCADE;
ALTER TABLE ma_audit_ref_default ADD CONSTRAINT ma_audit_ref_default_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event_default (id, timestamp)
        ON DELETE CASCADE;
-- endregion

-- region Schema versioning and upgrading
/*
Procedure applying a DB schema/data change for audit tables.
Use sequential change numbers to identify the changes.
This protects re-execution of the same change on the same database instance.
Use dollar-quoted string constant for a change, examples are lower, docs here:
https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
The transaction is committed if the change is executed.
The change number is NOT semantic and uses different key than original 'databaseSchemaVersion'.
Semantic schema versioning is still possible, but now only for information purposes.

Example of an DB upgrade script (stuff between $$ can be multiline, here compressed for brevity):
CALL apply_audit_change(1, $$ create table x(a int); insert into x values (1); $$);
CALL apply_audit_change(2, $$ alter table x add column b text; insert into x values (2, 'two'); $$);
-- not a good idea in general, but "true" forces the execution; it never updates change # to lower
CALL apply_audit_change(1, $$ insert into x values (3, 'three'); $$, true);
*/
CREATE OR REPLACE PROCEDURE apply_audit_change(changeNumber int, change TEXT, force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    lastChange int;
BEGIN
    SELECT value INTO lastChange FROM m_global_metadata WHERE name = 'schemaAuditChangeNumber';

    -- change is executed if the changeNumber is newer - or if forced
    IF lastChange IS NULL OR lastChange < changeNumber OR force THEN
        EXECUTE change;
        RAISE NOTICE 'Audit change #% executed!', changeNumber;

        IF lastChange IS NULL THEN
            INSERT INTO m_global_metadata (name, value) VALUES ('schemaAuditChangeNumber', changeNumber);
        ELSIF changeNumber > lastChange THEN
            -- even with force we never want to set lower change number, hence the IF above
            UPDATE m_global_metadata SET value = changeNumber WHERE name = 'schemaAuditChangeNumber';
        END IF;
        COMMIT;
    ELSE
        RAISE NOTICE 'Audit change #% skipped - not newer than the last change #%!', changeNumber, lastChange;
    END IF;
END $$;
-- endregion

-- https://www.postgresql.org/docs/current/runtime-config-query.html#GUC-ENABLE-PARTITIONWISE-JOIN
DO $$ BEGIN
    EXECUTE 'ALTER DATABASE ' || current_database() || ' SET enable_partitionwise_join TO on';
END; $$;

-- region partition creation procedures
-- Use negative futureCount for creating partitions for the past months if needed.
-- See also the comment below the procedure for more details.
CREATE OR REPLACE PROCEDURE audit_create_monthly_partitions(futureCount int)
    LANGUAGE plpgsql
AS $$
DECLARE
    dateFrom TIMESTAMPTZ = date_trunc('month', current_timestamp);
    dateTo TIMESTAMPTZ;
    tableSuffix TEXT;
BEGIN
    -- noinspection SqlUnused
    FOR i IN 1..abs(futureCount) loop
        dateTo := dateFrom + interval '1 month';
        tableSuffix := to_char(dateFrom, 'YYYYMM');

        BEGIN
            -- PERFORM = select without using the result
            PERFORM ('ma_audit_event_' || tableSuffix)::regclass;
            RAISE NOTICE 'Tables for partition % already exist, OK...', tableSuffix;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Creating partitions for range: % - %', dateFrom, dateTo;

            -- values FROM are inclusive (>=), TO are exclusive (<)
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_event FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_event_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_delta FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_delta_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_ref FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_ref_' || tableSuffix, dateFrom, dateTo);

/*
For info about what is and is not automatically created on the partition, see:
https://www.postgresql.org/docs/13/sql-createtable.html (search for "PARTITION OF parent_table")
In short, for our case PK and constraints are created automatically, but FK are not.
*/
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_delta_' || tableSuffix,
                    'ma_audit_delta_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_ref_' || tableSuffix,
                    'ma_audit_ref_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
        END;

        IF futureCount < 0 THEN
            -- going to the past
            dateFrom := dateFrom - interval '1 month';
        ELSE
            dateFrom := dateTo;
        END IF;

    END loop;
END $$;
-- endregion

/*
IMPORTANT: Only default partitions are created in this script!
Consider, whether you need partitioning before doing anything, for more read the docs:
https://docs.evolveum.com/midpoint/reference/repository/native-audit/#partitioning

Use something like this, if you desire monthly partitioning:
call audit_create_monthly_partitions(120);

This creates 120 monthly partitions into the future (10 years).
It can be safely called multiple times, so you can run it again anytime in the future.
If you forget to run, audit events will go to default partition so no data is lost,
however it may be complicated to organize it into proper partitions after the fact.

Create past partitions if needed, e.g. for migration. E.g., for last 12 months (including current):
call audit_create_monthly_partitions(-12);

Check the existing partitions with this SQL query:
select inhrelid::regclass as partition
from pg_inherits
where inhparent = 'ma_audit_event'::regclass;

Try this to see recent audit events with the real table where they are stored:
select tableoid::regclass::text AS table_name, *
from ma_audit_event
order by id desc
limit 50;
*/

-- Initializing the last change number used in postgres-new-upgrade.sql.
-- This is important to avoid applying any change more than once.
-- Also update SqaleUtils.CURRENT_SCHEMA_AUDIT_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java
call apply_audit_change(7, $$ SELECT 1 $$, true);

```

## /Users/ddonahoe/code/midpoint/database/4.8.0/postgres-new-quartz.sql

```typescript
/*
 * Copyright (C) 2010-2021 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- Thanks to Patrick Lightbody for submitting this.

drop table if exists qrtz_fired_triggers;
DROP TABLE if exists QRTZ_PAUSED_TRIGGER_GRPS;
DROP TABLE if exists QRTZ_SCHEDULER_STATE;
DROP TABLE if exists QRTZ_LOCKS;
drop table if exists qrtz_simple_triggers;
drop table if exists qrtz_cron_triggers;
drop table if exists qrtz_simprop_triggers;
DROP TABLE if exists QRTZ_BLOB_TRIGGERS;
drop table if exists qrtz_triggers;
drop table if exists qrtz_job_details;
drop table if exists qrtz_calendars;

CREATE TABLE qrtz_job_details (
    SCHED_NAME VARCHAR(120) NOT NULL,
    JOB_NAME VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    JOB_CLASS_NAME VARCHAR(250) NOT NULL,
    IS_DURABLE BOOL NOT NULL,
    IS_NONCONCURRENT BOOL NOT NULL,
    IS_UPDATE_DATA BOOL NOT NULL,
    REQUESTS_RECOVERY BOOL NOT NULL,
    JOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME, JOB_NAME, JOB_GROUP)
);

CREATE TABLE qrtz_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    JOB_NAME VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    NEXT_FIRE_TIME BIGINT NULL,
    PREV_FIRE_TIME BIGINT NULL,
    PRIORITY INTEGER NULL,
    EXECUTION_GROUP VARCHAR(200) NULL,
    TRIGGER_STATE VARCHAR(16) NOT NULL,
    TRIGGER_TYPE VARCHAR(8) NOT NULL,
    START_TIME BIGINT NOT NULL,
    END_TIME BIGINT NULL,
    CALENDAR_NAME VARCHAR(200) NULL,
    MISFIRE_INSTR SMALLINT NULL,
    JOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, JOB_NAME, JOB_GROUP)
        REFERENCES QRTZ_JOB_DETAILS(SCHED_NAME, JOB_NAME, JOB_GROUP)
);

CREATE TABLE qrtz_simple_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    REPEAT_COUNT BIGINT NOT NULL,
    REPEAT_INTERVAL BIGINT NOT NULL,
    TIMES_TRIGGERED BIGINT NOT NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_cron_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    CRON_EXPRESSION VARCHAR(120) NOT NULL,
    TIME_ZONE_ID VARCHAR(80),
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_simprop_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    STR_PROP_1 VARCHAR(512) NULL,
    STR_PROP_2 VARCHAR(512) NULL,
    STR_PROP_3 VARCHAR(512) NULL,
    INT_PROP_1 INT NULL,
    INT_PROP_2 INT NULL,
    LONG_PROP_1 BIGINT NULL,
    LONG_PROP_2 BIGINT NULL,
    DEC_PROP_1 NUMERIC(13, 4) NULL,
    DEC_PROP_2 NUMERIC(13, 4) NULL,
    BOOL_PROP_1 BOOL NULL,
    BOOL_PROP_2 BOOL NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_blob_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    BLOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_calendars (
    SCHED_NAME VARCHAR(120) NOT NULL,
    CALENDAR_NAME VARCHAR(200) NOT NULL,
    CALENDAR BYTEA NOT NULL,
    PRIMARY KEY (SCHED_NAME, CALENDAR_NAME)
);


CREATE TABLE qrtz_paused_trigger_grps (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_fired_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    ENTRY_ID VARCHAR(95) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    FIRED_TIME BIGINT NOT NULL,
    SCHED_TIME BIGINT NOT NULL,
    PRIORITY INTEGER NOT NULL,
    EXECUTION_GROUP VARCHAR(200) NULL,
    STATE VARCHAR(16) NOT NULL,
    JOB_NAME VARCHAR(200) NULL,
    JOB_GROUP VARCHAR(200) NULL,
    IS_NONCONCURRENT BOOL NULL,
    REQUESTS_RECOVERY BOOL NULL,
    PRIMARY KEY (SCHED_NAME, ENTRY_ID)
);

CREATE TABLE qrtz_scheduler_state (
    SCHED_NAME VARCHAR(120) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    LAST_CHECKIN_TIME BIGINT NOT NULL,
    CHECKIN_INTERVAL BIGINT NOT NULL,
    PRIMARY KEY (SCHED_NAME, INSTANCE_NAME)
);

CREATE TABLE qrtz_locks (
    SCHED_NAME VARCHAR(120) NOT NULL,
    LOCK_NAME VARCHAR(40) NOT NULL,
    PRIMARY KEY (SCHED_NAME, LOCK_NAME)
);

create index idx_qrtz_j_req_recovery on qrtz_job_details(SCHED_NAME, REQUESTS_RECOVERY);
create index idx_qrtz_j_grp on qrtz_job_details(SCHED_NAME, JOB_GROUP);

create index idx_qrtz_t_j on qrtz_triggers(SCHED_NAME, JOB_NAME, JOB_GROUP);
create index idx_qrtz_t_jg on qrtz_triggers(SCHED_NAME, JOB_GROUP);
create index idx_qrtz_t_c on qrtz_triggers(SCHED_NAME, CALENDAR_NAME);
create index idx_qrtz_t_g on qrtz_triggers(SCHED_NAME, TRIGGER_GROUP);
create index idx_qrtz_t_state on qrtz_triggers(SCHED_NAME, TRIGGER_STATE);
create index idx_qrtz_t_n_state on qrtz_triggers(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP, TRIGGER_STATE);
create index idx_qrtz_t_n_g_state on qrtz_triggers(SCHED_NAME, TRIGGER_GROUP, TRIGGER_STATE);
create index idx_qrtz_t_next_fire_time on qrtz_triggers(SCHED_NAME, NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_st on qrtz_triggers(SCHED_NAME, TRIGGER_STATE, NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_misfire on qrtz_triggers(SCHED_NAME, MISFIRE_INSTR, NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_st_misfire on qrtz_triggers(SCHED_NAME, MISFIRE_INSTR, NEXT_FIRE_TIME, TRIGGER_STATE);
create index idx_qrtz_t_nft_st_misfire_grp on qrtz_triggers(SCHED_NAME, MISFIRE_INSTR, NEXT_FIRE_TIME, TRIGGER_GROUP, TRIGGER_STATE);

create index idx_qrtz_ft_trig_inst_name on qrtz_fired_triggers(SCHED_NAME, INSTANCE_NAME);
create index idx_qrtz_ft_inst_job_req_rcvry on qrtz_fired_triggers(SCHED_NAME, INSTANCE_NAME, REQUESTS_RECOVERY);
create index idx_qrtz_ft_j_g on qrtz_fired_triggers(SCHED_NAME, JOB_NAME, JOB_GROUP);
create index idx_qrtz_ft_jg on qrtz_fired_triggers(SCHED_NAME, JOB_GROUP);
create index idx_qrtz_ft_t_g on qrtz_fired_triggers(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP);
create index idx_qrtz_ft_tg on qrtz_fired_triggers(SCHED_NAME, TRIGGER_GROUP);

```

## /Users/ddonahoe/code/midpoint/database/4.8.0/postgres-new.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- Naming conventions:
-- M_ prefix is used for tables in main part of the repo, MA_ for audit tables (can be separate)
-- Constraints/indexes use table_column(s)_suffix convention, with PK for primary key,
-- FK foreign key, IDX for index, KEY for unique index.
-- TR is suffix for triggers.
-- Names are generally lowercase (despite prefix/suffixes above in uppercase ;-)).
-- Column names are Java style and match attribute names from M-classes (e.g. MObject).
--
-- Other notes:
-- TEXT is used instead of VARCHAR, see: https://dba.stackexchange.com/a/21496/157622
-- We prefer "CREATE UNIQUE INDEX" to "ALTER TABLE ... ADD CONSTRAINT", unless the column
-- is marked as UNIQUE directly - then the index is implied, don't create it explicitly.
--
-- For Audit tables see 'postgres-new-audit.sql' right next to this file.
-- For Quartz tables see 'postgres-new-quartz.sql'.

-- noinspection SqlResolveForFile @ operator-class/"gin__int_ops"

-- just in case MIDPOINT schema was dropped (fastest way to remove all midpoint objects)
-- drop schema midpoint cascade;
-- VT CUSTOMIZE: extensions must be created by DBAA
-- To view installed extensions:
-- select name,installed_version from pg_available_extensions where installed_version is not null order by name;

--CREATE SCHEMA IF NOT EXISTS midpoint;
--CREATE EXTENSION IF NOT EXISTS intarray; -- support for indexing INTEGER[] columns
--CREATE EXTENSION IF NOT EXISTS pg_trgm; -- support for trigram indexes
--CREATE EXTENSION IF NOT EXISTS fuzzystrmatch; -- fuzzy string match (levenshtein, etc.)

-- region custom enum types
-- Some enums are from schema, some are only defined in repo-sqale.
-- All Java enum types must be registered in SqaleRepoContext constructor.

-- First purely repo-sqale enums (these have M prefix in Java, the rest of the name is the same):
CREATE TYPE ContainerType AS ENUM (
    'ACCESS_CERTIFICATION_CASE',
    'ACCESS_CERTIFICATION_WORK_ITEM',
    'AFFECTED_OBJECTS',
    'ASSIGNMENT',
    'CASE_WORK_ITEM',
    'FOCUS_IDENTITY',
    'INDUCEMENT',
    'LOOKUP_TABLE_ROW',
    'OPERATION_EXECUTION',
    'SIMULATION_RESULT_PROCESSED_OBJECT',
    'TRIGGER');

-- NOTE: Keep in sync with the same enum in postgres-new-audit.sql!
CREATE TYPE ObjectType AS ENUM (
    'ABSTRACT_ROLE',
    'ACCESS_CERTIFICATION_CAMPAIGN',
    'ACCESS_CERTIFICATION_DEFINITION',
    'ARCHETYPE',
    'ASSIGNMENT_HOLDER',
    'CASE',
    'CONNECTOR',
    'CONNECTOR_HOST',
    'DASHBOARD',
    'FOCUS',
    'FORM',
    'FUNCTION_LIBRARY',
    'GENERIC_OBJECT',
    'LOOKUP_TABLE',
    'MARK',
    'MESSAGE_TEMPLATE',
    'NODE',
    'OBJECT',
    'OBJECT_COLLECTION',
    'OBJECT_TEMPLATE',
    'ORG',
    'REPORT',
    'REPORT_DATA',
    'RESOURCE',
    'ROLE',
    'ROLE_ANALYSIS_CLUSTER',
    'ROLE_ANALYSIS_SESSION',
    'SECURITY_POLICY',
    'SEQUENCE',
    'SERVICE',
    'SHADOW',
    'SIMULATION_RESULT',
    'SYSTEM_CONFIGURATION',
    'TASK',
    'USER',
    'VALUE_POLICY');

CREATE TYPE ReferenceType AS ENUM (
    'ARCHETYPE',
    'ASSIGNMENT_CREATE_APPROVER',
    'ASSIGNMENT_MODIFY_APPROVER',
    'ACCESS_CERT_WI_ASSIGNEE',
    'ACCESS_CERT_WI_CANDIDATE',
    'CASE_WI_ASSIGNEE',
    'CASE_WI_CANDIDATE',
    'DELEGATED',
    'INCLUDE',
    'OBJECT_CREATE_APPROVER',
    'OBJECT_EFFECTIVE_MARK',
    'OBJECT_MODIFY_APPROVER',
    'OBJECT_PARENT_ORG',
    'PERSONA',
    'PROCESSED_OBJECT_EVENT_MARK',
    'PROJECTION',
    'RESOURCE_BUSINESS_CONFIGURATION_APPROVER',
    'ROLE_MEMBERSHIP');

CREATE TYPE ExtItemHolderType AS ENUM (
    'EXTENSION',
    'ATTRIBUTES');

CREATE TYPE ExtItemCardinality AS ENUM (
    'SCALAR',
    'ARRAY');

-- Schema based enums have the same name like their enum classes (I like the Type suffix here):
CREATE TYPE AccessCertificationCampaignStateType AS ENUM (
    'CREATED', 'IN_REVIEW_STAGE', 'REVIEW_STAGE_DONE', 'IN_REMEDIATION', 'CLOSED');

CREATE TYPE ActivationStatusType AS ENUM ('ENABLED', 'DISABLED', 'ARCHIVED');

CREATE TYPE AdministrativeAvailabilityStatusType AS ENUM ('MAINTENANCE', 'OPERATIONAL');

CREATE TYPE AvailabilityStatusType AS ENUM ('DOWN', 'UP', 'BROKEN');

CREATE TYPE CorrelationSituationType AS ENUM ('UNCERTAIN', 'EXISTING_OWNER', 'NO_OWNER', 'ERROR');

CREATE TYPE ExecutionModeType AS ENUM ('FULL', 'PREVIEW', 'SHADOW_MANAGEMENT_PREVIEW', 'DRY_RUN', 'NONE', 'BUCKET_ANALYSIS');

CREATE TYPE LockoutStatusType AS ENUM ('NORMAL', 'LOCKED');

CREATE TYPE NodeOperationalStateType AS ENUM ('UP', 'DOWN', 'STARTING');

CREATE TYPE OperationExecutionRecordTypeType AS ENUM ('SIMPLE', 'COMPLEX');

-- NOTE: Keep in sync with the same enum in postgres-new-audit.sql!
CREATE TYPE OperationResultStatusType AS ENUM ('SUCCESS', 'WARNING', 'PARTIAL_ERROR',
    'FATAL_ERROR', 'HANDLED_ERROR', 'NOT_APPLICABLE', 'IN_PROGRESS', 'UNKNOWN');

CREATE TYPE OrientationType AS ENUM ('PORTRAIT', 'LANDSCAPE');

CREATE TYPE PredefinedConfigurationType AS ENUM ( 'PRODUCTION', 'DEVELOPMENT' );

CREATE TYPE ResourceAdministrativeStateType AS ENUM ('ENABLED', 'DISABLED');

CREATE TYPE ShadowKindType AS ENUM ('ACCOUNT', 'ENTITLEMENT', 'GENERIC', 'UNKNOWN');

CREATE TYPE SynchronizationSituationType AS ENUM (
    'DELETED', 'DISPUTED', 'LINKED', 'UNLINKED', 'UNMATCHED');

CREATE TYPE TaskAutoScalingModeType AS ENUM ('DISABLED', 'DEFAULT');

CREATE TYPE TaskBindingType AS ENUM ('LOOSE', 'TIGHT');

CREATE TYPE TaskExecutionStateType AS ENUM ('RUNNING', 'RUNNABLE', 'WAITING', 'SUSPENDED', 'CLOSED');

CREATE TYPE TaskRecurrenceType AS ENUM ('SINGLE', 'RECURRING');

CREATE TYPE TaskSchedulingStateType AS ENUM ('READY', 'WAITING', 'SUSPENDED', 'CLOSED');

CREATE TYPE TaskWaitingReasonType AS ENUM ('OTHER_TASKS', 'OTHER');

CREATE TYPE ThreadStopActionType AS ENUM ('RESTART', 'RESCHEDULE', 'SUSPEND', 'CLOSE');

CREATE TYPE TimeIntervalStatusType AS ENUM ('BEFORE', 'IN', 'AFTER');
-- endregion

-- region OID-pool table
-- To support gen_random_uuid() pgcrypto extension must be enabled for the database (not for PG 13).
-- select * from pg_available_extensions order by name;
DO $$
BEGIN
    PERFORM pg_get_functiondef('gen_random_uuid()'::regprocedure);
    RAISE NOTICE 'gen_random_uuid already exists, skipping create EXTENSION pgcrypto';
EXCEPTION WHEN undefined_function THEN
    CREATE EXTENSION pgcrypto;
END
$$;

-- "OID pool", provides generated OID, can be referenced by FKs.
CREATE TABLE m_object_oid (
    oid UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
-- endregion

-- region Functions/triggers
-- BEFORE INSERT trigger - must be declared on all concrete m_object sub-tables.
CREATE OR REPLACE FUNCTION insert_object_oid()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.oid IS NOT NULL THEN
        INSERT INTO m_object_oid VALUES (NEW.oid);
    ELSE
        INSERT INTO m_object_oid DEFAULT VALUES RETURNING oid INTO NEW.oid;
    END IF;
    -- before trigger must return NEW row to do something
    RETURN NEW;
END
$$;

-- AFTER DELETE trigger - must be declared on all concrete m_object sub-tables.
CREATE OR REPLACE FUNCTION delete_object_oid()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    delete from m_object_oid where oid = OLD.oid;
    -- after trigger returns null
    RETURN NULL;
END
$$;

-- BEFORE UPDATE trigger - must be declared on all concrete m_object sub-tables.
-- Checks that OID is not changed and updates db_modified column.
CREATE OR REPLACE FUNCTION before_update_object()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.oid = OLD.oid THEN
        NEW.db_modified = current_timestamp;
        -- must return NEW, NULL would skip the update
        RETURN NEW;
    END IF;

    -- OID changed, forbidden
    RAISE EXCEPTION 'UPDATE on "%" tried to change OID "%" to "%". OID is immutable and cannot be changed.',
        TG_TABLE_NAME, OLD.oid, NEW.oid;
END
$$;
-- endregion

-- region Enumeration/code/management tables
-- Key -> value config table for internal use.
CREATE TABLE m_global_metadata (
    name TEXT PRIMARY KEY,
    value TEXT
);

-- Catalog of often used URIs, typically channels and relation Q-names.
-- Never update values of "uri" manually to change URI for some objects
-- (unless you really want to migrate old URI to a new one).
-- URI can be anything, for QNames the format is based on QNameUtil ("prefix-url#localPart").
CREATE TABLE m_uri (
    id SERIAL NOT NULL PRIMARY KEY,
    uri TEXT NOT NULL UNIQUE
);

-- There can be more constants pre-filled, but that adds overhead, let the first-start do it.
-- Nothing in the application code should rely on anything inserted here, not even for 0=default.
-- Pinning 0 to default relation is merely for convenience when reading the DB tables.
INSERT INTO m_uri (id, uri)
    VALUES (0, 'http://midpoint.evolveum.com/xml/ns/public/common/org-3#default');
-- endregion

-- region for abstract tables m_object/container/reference
-- Purely abstract table (no entries are allowed). Represents ObjectType+ArchetypeHolderType.
-- See https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/objecttype/
-- Following is recommended for each concrete table (see m_resource for example):
-- 1) override OID like this (PK+FK): oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
-- 2) define object type class (change value as needed):
--   objectType ObjectType GENERATED ALWAYS AS ('XY') STORED CHECK (objectType = 'XY'),
--   The CHECK part helps with query optimization when the column is uses in WHERE.
-- 3) add three triggers <table_name>_oid_{insert|update|delete}_tr
-- 4) add indexes for nameOrig and nameNorm columns (nameNorm as unique)
-- 5) the rest varies on the concrete table, other indexes or constraints, etc.
-- 6) any required FK must be created on the concrete table, even for inherited columns
CREATE TABLE m_object (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    oid UUID NOT NULL,
    -- objectType will be overridden with GENERATED value in concrete table
    -- CHECK helps optimizer to avoid this table when different type is asked, mind that
    -- WHERE objectType = 'OBJECT' never returns anything (unlike select * from m_object).
    -- We don't want this check to be inherited as it would prevent any inserts of other types.

    -- PG16: ObjectType column will be added later, it needs to have different definition for PG < 16 and PG >= 16
    -- and it is not possible to achieve that definition with ALTER COLUMN statement
    -- objectType ObjectType NOT NULL CHECK (objectType = 'OBJECT') NO INHERIT,
    nameOrig TEXT NOT NULL,
    nameNorm TEXT NOT NULL,
    fullObject BYTEA,
    tenantRefTargetOid UUID,
    tenantRefTargetType ObjectType,
    tenantRefRelationId INTEGER REFERENCES m_uri(id),
    lifecycleState TEXT, -- TODO what is this? how many distinct values?
    cidSeq BIGINT NOT NULL DEFAULT 1, -- sequence for container id, next free cid
    version INTEGER NOT NULL DEFAULT 1,
    -- complex DB columns, add indexes as needed per concrete table, e.g. see m_user
    -- TODO compare with [] in JSONB, check performance, indexing, etc. first
    policySituations INTEGER[], -- soft-references m_uri, only EQ filter
    subtypes TEXT[], -- only EQ filter
    fullTextInfo TEXT,
    /*
    Extension items are stored as JSON key:value pairs, where key is m_ext_item.id (as string)
    and values are stored as follows (this is internal and has no effect on how query is written):
    - string and boolean are stored as-is
    - any numeric type integral/float/precise is stored as NUMERIC (JSONB can store that)
    - enum as toString() or name() of the Java enum instance
    - date-time as Instant.toString() ISO-8601 long date-timeZ (UTC), cut to 3 fraction digits
    - poly-string is stored as sub-object {"o":"orig-value","n":"norm-value"}
    - reference is stored as sub-object {"o":"oid","t":"targetType","r":"relationId"}
    - - where targetType is ObjectType and relationId is from m_uri.id, just like for ref columns
    */
    ext JSONB,
    -- metadata
    creatorRefTargetOid UUID,
    creatorRefTargetType ObjectType,
    creatorRefRelationId INTEGER REFERENCES m_uri(id),
    createChannelId INTEGER REFERENCES m_uri(id),
    createTimestamp TIMESTAMPTZ,
    modifierRefTargetOid UUID,
    modifierRefTargetType ObjectType,
    modifierRefRelationId INTEGER REFERENCES m_uri(id),
    modifyChannelId INTEGER REFERENCES m_uri(id),
    modifyTimestamp TIMESTAMPTZ,

    -- these are purely DB-managed metadata, not mapped to in midPoint
    db_created TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    db_modified TIMESTAMPTZ NOT NULL DEFAULT current_timestamp, -- updated in update trigger

    -- prevents inserts to this table, but not to inherited ones; this makes it "abstract" table
    CHECK (FALSE) NO INHERIT
);




-- Important objectType column needs to be non-generated on PG < 16 and generated on PG>=16
--
-- Before Postgres 16: if parent column was generated, child columns must use same value
-- After 16: Parent must be generated, if children are generated, they may have different generation values
do $$
declare
  pg16 int;
begin

-- Are we on Posgres 16 or newer? we cannot use VERSION() since it returns formated string
SELECT 1 FROM "pg_settings" into pg16 WHERE "name" = 'server_version_num' AND "setting" >= '160000';
  if pg16 then
       ALTER TABLE m_object ADD COLUMN objectType ObjectType GENERATED ALWAYS AS ('OBJECT') STORED NOT NULL CHECK (objectType = 'OBJECT') NO INHERIT;
    else
       -- PG 15 and lower
       ALTER TABLE m_object ADD COLUMN objectType ObjectType NOT NULL CHECK (objectType = 'OBJECT') NO INHERIT;
  end if;
end $$;




-- No indexes here, always add indexes and referential constraints on concrete sub-tables.

-- Represents AssignmentHolderType (all objects except shadows)
-- extending m_object, but still abstract, hence the CHECK (false)
CREATE TABLE m_assignment_holder (
    -- objectType will be overridden with GENERATED value in concrete table
    objectType ObjectType NOT NULL CHECK (objectType = 'ASSIGNMENT_HOLDER') NO INHERIT,

    CHECK (FALSE) NO INHERIT
)
    INHERITS (m_object);

-- Purely abstract table (no entries are allowed). Represents Containerable/PrismContainerValue.
-- Allows querying all separately persisted containers, but not necessary for the application.
CREATE TABLE m_container (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    -- Owner does not have to be the direct parent of the container.
    ownerOid UUID NOT NULL,
    -- use like this on the concrete table:
    -- ownerOid UUID NOT NULL REFERENCES m_object_oid(oid),

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    -- containerType will be overridden with GENERATED value in concrete table
    -- containerType will be added by ALTER because we need different definition between PG Versions
    -- containerType ContainerType NOT NULL,

    CHECK (FALSE) NO INHERIT
    -- add on concrete table (additional columns possible): PRIMARY KEY (ownerOid, cid)
);
-- Abstract reference table, for object but also other container references.
CREATE TABLE m_reference (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    ownerType ObjectType NOT NULL,
    -- referenceType will be overridden with GENERATED value in concrete table
    -- referenceType will be added by ALTER because we need different definition between PG Versions

    targetOid UUID NOT NULL, -- soft-references m_object
    targetType ObjectType NOT NULL,
    relationId INTEGER NOT NULL REFERENCES m_uri(id),

    -- prevents inserts to this table, but not to inherited ones; this makes it "abstract" table
    CHECK (FALSE) NO INHERIT
    -- add PK (referenceType is the same per table): PRIMARY KEY (ownerOid, relationId, targetOid)
);

-- Important: referenceType, containerType column needs to be non-generated on PG < 16 and generated on PG>=16
--
-- Before Postgres 16: if parent column was generated, child columns must use same value
-- After 16: Parent must be generated, if children are generated, they may have different generation values
do $$
declare
  pg16 int;
begin

-- Are we on Postgres 16 or newer? we cannot use VERSION() since it returns formated string
SELECT 1 FROM "pg_settings" into pg16 WHERE "name" = 'server_version_num' AND "setting" >= '160000';
  if pg16 then
       ALTER TABLE m_reference ADD COLUMN referenceType ReferenceType  GENERATED ALWAYS AS (NULL) STORED NOT NULL;
       ALTER TABLE m_container ADD COLUMN containerType ContainerType  GENERATED ALWAYS AS (NULL) STORED NOT NULL;
    else
       -- PG 15 and lower
       ALTER TABLE m_reference ADD COLUMN referenceType ReferenceType NOT NULL;
       ALTER TABLE m_container ADD COLUMN containerType ContainerType NOT NULL;
  end if;
end $$;

-- Add this index for each sub-table (reference type is not necessary, each sub-table has just one).
-- CREATE INDEX m_reference_targetOidRelationId_idx ON m_reference (targetOid, relationId);


-- references related to ObjectType and AssignmentHolderType
-- stores AssignmentHolderType/archetypeRef
CREATE TABLE m_ref_archetype (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('ARCHETYPE') STORED
        CHECK (referenceType = 'ARCHETYPE'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_archetype_targetOidRelationId_idx
    ON m_ref_archetype (targetOid, relationId);

-- stores AssignmentHolderType/delegatedRef
CREATE TABLE m_ref_delegated (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('DELEGATED') STORED
        CHECK (referenceType = 'DELEGATED'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_delegated_targetOidRelationId_idx
    ON m_ref_delegated (targetOid, relationId);

-- stores ObjectType/metadata/createApproverRef
CREATE TABLE m_ref_object_create_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_CREATE_APPROVER') STORED
        CHECK (referenceType = 'OBJECT_CREATE_APPROVER'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_create_approver_targetOidRelationId_idx
    ON m_ref_object_create_approver (targetOid, relationId);


-- stores ObjectType/effectiveMarkRef
CREATE TABLE m_ref_object_effective_mark (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_EFFECTIVE_MARK') STORED
        CHECK (referenceType = 'OBJECT_EFFECTIVE_MARK'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_effective_mark_targetOidRelationId_idx
    ON m_ref_object_effective_mark (targetOid, relationId);


-- stores ObjectType/metadata/modifyApproverRef
CREATE TABLE m_ref_object_modify_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_MODIFY_APPROVER') STORED
        CHECK (referenceType = 'OBJECT_MODIFY_APPROVER'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_modify_approver_targetOidRelationId_idx
    ON m_ref_object_modify_approver (targetOid, relationId);

-- stores AssignmentHolderType/roleMembershipRef
CREATE TABLE m_ref_role_membership (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('ROLE_MEMBERSHIP') STORED
        CHECK (referenceType = 'ROLE_MEMBERSHIP'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_role_membership_targetOidRelationId_idx
    ON m_ref_role_membership (targetOid, relationId);
-- endregion

-- region FOCUS related tables
-- Represents FocusType (Users, Roles, ...), see https://docs.evolveum.com/midpoint/reference/schema/focus-and-projections/
-- extending m_object, but still abstract, hence the CHECK (false)
CREATE TABLE m_focus (
    -- objectType will be overridden with GENERATED value in concrete table
    objectType ObjectType NOT NULL CHECK (objectType = 'FOCUS') NO INHERIT,
    costCenter TEXT,
    emailAddress TEXT,
    photo BYTEA, -- will be TOAST-ed if necessary
    locale TEXT,
    localityOrig TEXT,
    localityNorm TEXT,
    preferredLanguage TEXT,
    telephoneNumber TEXT,
    timezone TEXT,
    -- credential/password/metadata
    passwordCreateTimestamp TIMESTAMPTZ,
    passwordModifyTimestamp TIMESTAMPTZ,
    -- activation
    administrativeStatus ActivationStatusType,
    effectiveStatus ActivationStatusType,
    enableTimestamp TIMESTAMPTZ,
    disableTimestamp TIMESTAMPTZ,
    disableReason TEXT,
    validityStatus TimeIntervalStatusType,
    validFrom TIMESTAMPTZ,
    validTo TIMESTAMPTZ,
    validityChangeTimestamp TIMESTAMPTZ,
    archiveTimestamp TIMESTAMPTZ,
    lockoutStatus LockoutStatusType,
    normalizedData JSONB,

    CHECK (FALSE) NO INHERIT
)
    INHERITS (m_assignment_holder);

-- for each concrete sub-table indexes must be added, validFrom, validTo, etc.

-- stores FocusType/personaRef
CREATE TABLE m_ref_persona (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('PERSONA') STORED
        CHECK (referenceType = 'PERSONA'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_persona_targetOidRelationId_idx
    ON m_ref_persona (targetOid, relationId);

-- stores FocusType/linkRef ("projection" is newer and better term)
CREATE TABLE m_ref_projection (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('PROJECTION') STORED
        CHECK (referenceType = 'PROJECTION'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_projection_targetOidRelationId_idx
    ON m_ref_projection (targetOid, relationId);

CREATE TABLE m_focus_identity (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('FOCUS_IDENTITY') STORED
        CHECK (containerType = 'FOCUS_IDENTITY'),
    fullObject BYTEA,
    sourceResourceRefTargetOid UUID,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_focus_identity_sourceResourceRefTargetOid_idx ON m_focus_identity (sourceResourceRefTargetOid);

-- Represents GenericObjectType, see https://docs.evolveum.com/midpoint/reference/schema/generic-objects/
CREATE TABLE m_generic_object (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('GENERIC_OBJECT') STORED
        CHECK (objectType = 'GENERIC_OBJECT')
)
    INHERITS (m_focus);

CREATE TRIGGER m_generic_object_oid_insert_tr BEFORE INSERT ON m_generic_object
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_generic_object_update_tr BEFORE UPDATE ON m_generic_object
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_generic_object_oid_delete_tr AFTER DELETE ON m_generic_object
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_generic_object_nameOrig_idx ON m_generic_object (nameOrig);
CREATE UNIQUE INDEX m_generic_object_nameNorm_key ON m_generic_object (nameNorm);
CREATE INDEX m_generic_object_subtypes_idx ON m_generic_object USING gin(subtypes);
CREATE INDEX m_generic_object_validFrom_idx ON m_generic_object (validFrom);
CREATE INDEX m_generic_object_validTo_idx ON m_generic_object (validTo);
CREATE INDEX m_generic_object_fullTextInfo_idx
    ON m_generic_object USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_generic_object_createTimestamp_idx ON m_generic_object (createTimestamp);
CREATE INDEX m_generic_object_modifyTimestamp_idx ON m_generic_object (modifyTimestamp);
-- endregion

-- region USER related tables
-- Represents UserType, see https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/usertype/
CREATE TABLE m_user (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('USER') STORED
        CHECK (objectType = 'USER'),
    additionalNameOrig TEXT,
    additionalNameNorm TEXT,
    employeeNumber TEXT,
    familyNameOrig TEXT,
    familyNameNorm TEXT,
    fullNameOrig TEXT,
    fullNameNorm TEXT,
    givenNameOrig TEXT,
    givenNameNorm TEXT,
    honorificPrefixOrig TEXT,
    honorificPrefixNorm TEXT,
    honorificSuffixOrig TEXT,
    honorificSuffixNorm TEXT,
    nickNameOrig TEXT,
    nickNameNorm TEXT,
    personalNumber TEXT,
    titleOrig TEXT,
    titleNorm TEXT,
    organizations JSONB, -- array of {o,n} objects (poly-strings)
    organizationUnits JSONB -- array of {o,n} objects (poly-strings)
)
    INHERITS (m_focus);

CREATE TRIGGER m_user_oid_insert_tr BEFORE INSERT ON m_user
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_user_update_tr BEFORE UPDATE ON m_user
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_user_oid_delete_tr AFTER DELETE ON m_user
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_user_nameOrig_idx ON m_user (nameOrig);
CREATE UNIQUE INDEX m_user_nameNorm_key ON m_user (nameNorm);
CREATE INDEX m_user_policySituation_idx ON m_user USING gin(policysituations gin__int_ops);
CREATE INDEX m_user_ext_idx ON m_user USING gin(ext);
CREATE INDEX m_user_fullNameOrig_idx ON m_user (fullNameOrig);
CREATE INDEX m_user_familyNameOrig_idx ON m_user (familyNameOrig);
CREATE INDEX m_user_givenNameOrig_idx ON m_user (givenNameOrig);
CREATE INDEX m_user_employeeNumber_idx ON m_user (employeeNumber);
CREATE INDEX m_user_subtypes_idx ON m_user USING gin(subtypes);
CREATE INDEX m_user_organizations_idx ON m_user USING gin(organizations);
CREATE INDEX m_user_organizationUnits_idx ON m_user USING gin(organizationUnits);
CREATE INDEX m_user_validFrom_idx ON m_user (validFrom);
CREATE INDEX m_user_validTo_idx ON m_user (validTo);
CREATE INDEX m_user_fullTextInfo_idx ON m_user USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_user_createTimestamp_idx ON m_user (createTimestamp);
CREATE INDEX m_user_modifyTimestamp_idx ON m_user (modifyTimestamp);
-- endregion

-- region ROLE related tables
-- Represents AbstractRoleType, see https://docs.evolveum.com/midpoint/architecture/concepts/abstract-role/
CREATE TABLE m_abstract_role (
    -- objectType will be overridden with GENERATED value in concrete table
    objectType ObjectType NOT NULL CHECK (objectType = 'ABSTRACT_ROLE') NO INHERIT,
    autoAssignEnabled BOOLEAN,
    displayNameOrig TEXT,
    displayNameNorm TEXT,
    identifier TEXT,
    requestable BOOLEAN,
    riskLevel TEXT,

    CHECK (FALSE) NO INHERIT
)
    INHERITS (m_focus);

/*
TODO: add for sub-tables, role, org... all? how many services?
 identifier is OK (TEXT), but booleans are useless unless used in WHERE
CREATE INDEX iAbstractRoleIdentifier ON m_abstract_role (identifier);
CREATE INDEX iRequestable ON m_abstract_role (requestable);
CREATE INDEX iAutoassignEnabled ON m_abstract_role(autoassign_enabled);
*/

-- Represents RoleType, see https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/roletype/
CREATE TABLE m_role (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE') STORED
        CHECK (objectType = 'ROLE')
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_role_oid_insert_tr BEFORE INSERT ON m_role
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_update_tr BEFORE UPDATE ON m_role
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_oid_delete_tr AFTER DELETE ON m_role
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_role_nameOrig_idx ON m_role (nameOrig);
CREATE UNIQUE INDEX m_role_nameNorm_key ON m_role (nameNorm);
CREATE INDEX m_role_subtypes_idx ON m_role USING gin(subtypes);
CREATE INDEX m_role_identifier_idx ON m_role (identifier);
CREATE INDEX m_role_validFrom_idx ON m_role (validFrom);
CREATE INDEX m_role_validTo_idx ON m_role (validTo);
CREATE INDEX m_role_fullTextInfo_idx ON m_role USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_role_createTimestamp_idx ON m_role (createTimestamp);
CREATE INDEX m_role_modifyTimestamp_idx ON m_role (modifyTimestamp);

-- Represents ServiceType, see https://docs.evolveum.com/midpoint/reference/deployment/service-account-management/
CREATE TABLE m_service (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SERVICE') STORED
        CHECK (objectType = 'SERVICE'),
    displayOrder INTEGER
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_service_oid_insert_tr BEFORE INSERT ON m_service
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_service_update_tr BEFORE UPDATE ON m_service
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_service_oid_delete_tr AFTER DELETE ON m_service
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_service_nameOrig_idx ON m_service (nameOrig);
CREATE UNIQUE INDEX m_service_nameNorm_key ON m_service (nameNorm);
CREATE INDEX m_service_subtypes_idx ON m_service USING gin(subtypes);
CREATE INDEX m_service_identifier_idx ON m_service (identifier);
CREATE INDEX m_service_validFrom_idx ON m_service (validFrom);
CREATE INDEX m_service_validTo_idx ON m_service (validTo);
CREATE INDEX m_service_fullTextInfo_idx ON m_service USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_service_createTimestamp_idx ON m_service (createTimestamp);
CREATE INDEX m_service_modifyTimestamp_idx ON m_service (modifyTimestamp);

-- Represents ArchetypeType, see https://docs.evolveum.com/midpoint/reference/schema/archetypes/
CREATE TABLE m_archetype (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ARCHETYPE') STORED
        CHECK (objectType = 'ARCHETYPE')
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_archetype_oid_insert_tr BEFORE INSERT ON m_archetype
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_archetype_update_tr BEFORE UPDATE ON m_archetype
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_archetype_oid_delete_tr AFTER DELETE ON m_archetype
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_archetype_nameOrig_idx ON m_archetype (nameOrig);
CREATE UNIQUE INDEX m_archetype_nameNorm_key ON m_archetype (nameNorm);
CREATE INDEX m_archetype_subtypes_idx ON m_archetype USING gin(subtypes);
CREATE INDEX m_archetype_identifier_idx ON m_archetype (identifier);
CREATE INDEX m_archetype_validFrom_idx ON m_archetype (validFrom);
CREATE INDEX m_archetype_validTo_idx ON m_archetype (validTo);
CREATE INDEX m_archetype_fullTextInfo_idx ON m_archetype USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_archetype_createTimestamp_idx ON m_archetype (createTimestamp);
CREATE INDEX m_archetype_modifyTimestamp_idx ON m_archetype (modifyTimestamp);
-- endregion

-- region Organization hierarchy support
-- Represents OrgType, see https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/orgtype/
CREATE TABLE m_org (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ORG') STORED
        CHECK (objectType = 'ORG'),
    displayOrder INTEGER,
    tenant BOOLEAN
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_org_oid_insert_tr BEFORE INSERT ON m_org
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_org_update_tr BEFORE UPDATE ON m_org
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_org_oid_delete_tr AFTER DELETE ON m_org
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_org_nameOrig_idx ON m_org (nameOrig);
CREATE UNIQUE INDEX m_org_nameNorm_key ON m_org (nameNorm);
CREATE INDEX m_org_displayOrder_idx ON m_org (displayOrder);
CREATE INDEX m_org_subtypes_idx ON m_org USING gin(subtypes);
CREATE INDEX m_org_identifier_idx ON m_org (identifier);
CREATE INDEX m_org_validFrom_idx ON m_org (validFrom);
CREATE INDEX m_org_validTo_idx ON m_org (validTo);
CREATE INDEX m_org_fullTextInfo_idx ON m_org USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_org_createTimestamp_idx ON m_org (createTimestamp);
CREATE INDEX m_org_modifyTimestamp_idx ON m_org (modifyTimestamp);

-- stores ObjectType/parentOrgRef
CREATE TABLE m_ref_object_parent_org (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_PARENT_ORG') STORED
        CHECK (referenceType = 'OBJECT_PARENT_ORG'),

    -- TODO wouldn't (ownerOid, targetOid, relationId) perform better for typical queries?
    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_parent_org_targetOidRelationId_idx
    ON m_ref_object_parent_org (targetOid, relationId);

-- region org-closure
/*
Trigger on m_ref_object_parent_org marks this view for refresh in one m_global_metadata row.
Closure contains also identity (org = org) entries because:
* It's easier to do optimized matrix-multiplication based refresh with them later.
* It actually makes some query easier and requires AND instead of OR conditions.
* While the table shows that o => o (=> means "is parent of"), this is not the semantics
of isParent/ChildOf searches and they never return parameter OID as a result.
*/
CREATE MATERIALIZED VIEW m_org_closure AS
WITH RECURSIVE org_h (
    ancestor_oid, -- ref.targetoid
    descendant_oid --ref.ownerOid
    -- paths -- number of different paths, not used for materialized view version
    -- depth -- possible later, but cycle detected must be added to the recursive term
) AS (
    -- non-recursive term:
    -- Gather all organization oids from parent-org refs and initialize identity lines (o => o).
    -- We don't want the orgs not in org hierarchy, that would require org triggers too.
    SELECT o.oid, o.oid FROM m_org o
        WHERE EXISTS(
            SELECT 1 FROM m_ref_object_parent_org r
                WHERE r.targetOid = o.oid OR r.ownerOid = o.oid)
    UNION
    -- recursive (iterative) term:
    -- Generate their parents (anc => desc, that is target => owner), => means "is parent of".
    SELECT par.targetoid, chi.descendant_oid -- leaving original child there generates closure
        FROM m_ref_object_parent_org as par, org_h as chi
        WHERE par.ownerOid = chi.ancestor_oid
)
SELECT * FROM org_h;

-- unique index is like PK if it was table
CREATE UNIQUE INDEX m_org_closure_asc_desc_idx
    ON m_org_closure (ancestor_oid, descendant_oid);
CREATE INDEX m_org_closure_desc_asc_idx
    ON m_org_closure (descendant_oid, ancestor_oid);

-- The trigger for m_ref_object_parent_org that flags the view for refresh.
CREATE OR REPLACE FUNCTION mark_org_closure_for_refresh()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'TRUNCATE' OR OLD.ownerType = 'ORG' OR NEW.ownerType = 'ORG' THEN
        INSERT INTO m_global_metadata VALUES ('orgClosureRefreshNeeded', 'true')
            ON CONFLICT (name) DO UPDATE SET value = 'true';
    END IF;

    -- after trigger returns null
    RETURN NULL;
END $$;

CREATE TRIGGER m_ref_object_parent_mark_refresh_tr
    AFTER INSERT OR UPDATE OR DELETE ON m_ref_object_parent_org
    FOR EACH ROW EXECUTE FUNCTION mark_org_closure_for_refresh();
CREATE TRIGGER m_ref_object_parent_mark_refresh_trunc_tr
    AFTER TRUNCATE ON m_ref_object_parent_org
    FOR EACH STATEMENT EXECUTE FUNCTION mark_org_closure_for_refresh();

-- The trigger that flags the view for refresh after m_org changes.
CREATE OR REPLACE FUNCTION mark_org_closure_for_refresh_org()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO m_global_metadata VALUES ('orgClosureRefreshNeeded', 'true')
        ON CONFLICT (name) DO UPDATE SET value = 'true';

    -- after trigger returns null
    RETURN NULL;
END $$;

-- Update is not necessary, it does not change relations between orgs.
-- If it does, it is handled by trigger on m_ref_object_parent_org.
CREATE TRIGGER m_org_mark_refresh_tr
    AFTER INSERT OR DELETE ON m_org
    FOR EACH ROW EXECUTE FUNCTION mark_org_closure_for_refresh_org();
CREATE TRIGGER m_org_mark_refresh_trunc_tr
    AFTER TRUNCATE ON m_org
    FOR EACH STATEMENT EXECUTE FUNCTION mark_org_closure_for_refresh_org();

-- This procedure for conditional refresh when needed is called from the application code.
-- The refresh can be forced, e.g. after many changes with triggers off (or just to be sure).
CREATE OR REPLACE PROCEDURE m_refresh_org_closure(force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    flag_val text;
BEGIN
    -- We use advisory session lock only for the check + refresh, then release it immediately.
    -- This can still dead-lock two transactions in a single thread on the select/delete combo,
    -- (I mean, who would do that?!) but works fine for parallel transactions.
    PERFORM pg_advisory_lock(47);
    BEGIN
        SELECT value INTO flag_val FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        IF flag_val = 'true' OR force THEN
            REFRESH MATERIALIZED VIEW m_org_closure;
            DELETE FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        END IF;
        PERFORM pg_advisory_unlock(47);
    EXCEPTION WHEN OTHERS THEN
        -- Whatever happens we definitely want to release the lock.
        PERFORM pg_advisory_unlock(47);
        RAISE;
    END;
END;
$$;
-- endregion

-- region OTHER object tables
-- Represents ResourceType, see https://docs.evolveum.com/midpoint/reference/resources/resource-configuration/
CREATE TABLE m_resource (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('RESOURCE') STORED
        CHECK (objectType = 'RESOURCE'),
    businessAdministrativeState ResourceAdministrativeStateType,
    -- administrativeOperationalState/administrativeAvailabilityStatus
    administrativeOperationalStateAdministrativeAvailabilityStatus AdministrativeAvailabilityStatusType,
    -- operationalState/lastAvailabilityStatus
    operationalStateLastAvailabilityStatus AvailabilityStatusType,
    connectorRefTargetOid UUID,
    connectorRefTargetType ObjectType,
    connectorRefRelationId INTEGER REFERENCES m_uri(id),
    template BOOLEAN,
    abstract BOOLEAN,
    superRefTargetOid UUID,
    superRefTargetType ObjectType,
    superRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_resource_oid_insert_tr BEFORE INSERT ON m_resource
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_resource_update_tr BEFORE UPDATE ON m_resource
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_resource_oid_delete_tr AFTER DELETE ON m_resource
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_resource_nameOrig_idx ON m_resource (nameOrig);
CREATE UNIQUE INDEX m_resource_nameNorm_key ON m_resource (nameNorm);
CREATE INDEX m_resource_subtypes_idx ON m_resource USING gin(subtypes);
CREATE INDEX m_resource_fullTextInfo_idx ON m_resource USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_resource_createTimestamp_idx ON m_resource (createTimestamp);
CREATE INDEX m_resource_modifyTimestamp_idx ON m_resource (modifyTimestamp);

-- stores ResourceType/business/approverRef
CREATE TABLE m_ref_resource_business_configuration_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS
        ('RESOURCE_BUSINESS_CONFIGURATION_APPROVER') STORED,

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_resource_biz_config_approver_targetOidRelationId_idx
    ON m_ref_resource_business_configuration_approver (targetOid, relationId);

-- Represents ShadowType, see https://docs.evolveum.com/midpoint/reference/resources/shadow/
-- and also https://docs.evolveum.com/midpoint/reference/schema/focus-and-projections/
CREATE TABLE m_shadow (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SHADOW') STORED
        CHECK (objectType = 'SHADOW'),
    objectClassId INTEGER REFERENCES m_uri(id),
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    intent TEXT,
    tag TEXT,
    kind ShadowKindType,
    dead BOOLEAN,
    exist BOOLEAN,
    fullSynchronizationTimestamp TIMESTAMPTZ,
    pendingOperationCount INTEGER NOT NULL,
    primaryIdentifierValue TEXT,
    synchronizationSituation SynchronizationSituationType,
    synchronizationTimestamp TIMESTAMPTZ,
    attributes JSONB,
    -- correlation
    correlationStartTimestamp TIMESTAMPTZ,
    correlationEndTimestamp TIMESTAMPTZ,
    correlationCaseOpenTimestamp TIMESTAMPTZ,
    correlationCaseCloseTimestamp TIMESTAMPTZ,
    correlationSituation CorrelationSituationType
)
    INHERITS (m_object);

CREATE TRIGGER m_shadow_oid_insert_tr BEFORE INSERT ON m_shadow
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_shadow_update_tr BEFORE UPDATE ON m_shadow
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_shadow_oid_delete_tr AFTER DELETE ON m_shadow
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_shadow_nameOrig_idx ON m_shadow (nameOrig);
CREATE INDEX m_shadow_nameNorm_idx ON m_shadow (nameNorm); -- may not be unique for shadows!
CREATE UNIQUE INDEX m_shadow_primIdVal_objCls_resRefOid_key
    ON m_shadow (primaryIdentifierValue, objectClassId, resourceRefTargetOid);

CREATE INDEX m_shadow_subtypes_idx ON m_shadow USING gin(subtypes);
CREATE INDEX m_shadow_policySituation_idx ON m_shadow USING gin(policysituations gin__int_ops);
CREATE INDEX m_shadow_ext_idx ON m_shadow USING gin(ext);
CREATE INDEX m_shadow_attributes_idx ON m_shadow USING gin(attributes);
CREATE INDEX m_shadow_fullTextInfo_idx ON m_shadow USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_shadow_resourceRefTargetOid_idx ON m_shadow (resourceRefTargetOid);
CREATE INDEX m_shadow_createTimestamp_idx ON m_shadow (createTimestamp);
CREATE INDEX m_shadow_modifyTimestamp_idx ON m_shadow (modifyTimestamp);
CREATE INDEX m_shadow_correlationStartTimestamp_idx ON m_shadow (correlationStartTimestamp);
CREATE INDEX m_shadow_correlationEndTimestamp_idx ON m_shadow (correlationEndTimestamp);
CREATE INDEX m_shadow_correlationCaseOpenTimestamp_idx ON m_shadow (correlationCaseOpenTimestamp);
CREATE INDEX m_shadow_correlationCaseCloseTimestamp_idx ON m_shadow (correlationCaseCloseTimestamp);

/*
TODO: reconsider, especially boolean things like dead (perhaps WHERE in other indexes?)
CREATE INDEX iShadowDead ON m_shadow (dead);
CREATE INDEX iShadowKind ON m_shadow (kind);
CREATE INDEX iShadowIntent ON m_shadow (intent);
CREATE INDEX iShadowObjectClass ON m_shadow (objectClass);
CREATE INDEX iShadowFailedOperationType ON m_shadow (failedOperationType);
CREATE INDEX iShadowSyncSituation ON m_shadow (synchronizationSituation);
CREATE INDEX iShadowPendingOperationCount ON m_shadow (pendingOperationCount);
*/

-- Represents NodeType, see https://docs.evolveum.com/midpoint/reference/deployment/clustering-ha/managing-cluster-nodes/
CREATE TABLE m_node (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('NODE') STORED
        CHECK (objectType = 'NODE'),
    nodeIdentifier TEXT,
    operationalState NodeOperationalStateType
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_node_oid_insert_tr BEFORE INSERT ON m_node
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_node_update_tr BEFORE UPDATE ON m_node
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_node_oid_delete_tr AFTER DELETE ON m_node
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_node_nameOrig_idx ON m_node (nameOrig);
CREATE UNIQUE INDEX m_node_nameNorm_key ON m_node (nameNorm);
-- not interested in other indexes for this one, this table will be small

-- Represents SystemConfigurationType, see https://docs.evolveum.com/midpoint/reference/concepts/system-configuration-object/
CREATE TABLE m_system_configuration (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SYSTEM_CONFIGURATION') STORED
        CHECK (objectType = 'SYSTEM_CONFIGURATION')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_system_configuration_oid_insert_tr BEFORE INSERT ON m_system_configuration
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_system_configuration_update_tr BEFORE UPDATE ON m_system_configuration
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_system_configuration_oid_delete_tr AFTER DELETE ON m_system_configuration
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE UNIQUE INDEX m_system_configuration_nameNorm_key ON m_system_configuration (nameNorm);
-- no need for the name index, m_system_configuration table is very small

-- Represents SecurityPolicyType, see https://docs.evolveum.com/midpoint/reference/security/security-policy/
CREATE TABLE m_security_policy (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SECURITY_POLICY') STORED
        CHECK (objectType = 'SECURITY_POLICY')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_security_policy_oid_insert_tr BEFORE INSERT ON m_security_policy
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_security_policy_update_tr BEFORE UPDATE ON m_security_policy
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_security_policy_oid_delete_tr AFTER DELETE ON m_security_policy
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_security_policy_nameOrig_idx ON m_security_policy (nameOrig);
CREATE UNIQUE INDEX m_security_policy_nameNorm_key ON m_security_policy (nameNorm);
CREATE INDEX m_security_policy_subtypes_idx ON m_security_policy USING gin(subtypes);
CREATE INDEX m_security_policy_policySituation_idx
    ON m_security_policy USING gin(policysituations gin__int_ops);
CREATE INDEX m_security_policy_fullTextInfo_idx
    ON m_security_policy USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_security_policy_createTimestamp_idx ON m_security_policy (createTimestamp);
CREATE INDEX m_security_policy_modifyTimestamp_idx ON m_security_policy (modifyTimestamp);

-- Represents ObjectCollectionType, see https://docs.evolveum.com/midpoint/reference/admin-gui/collections-views/configuration/
CREATE TABLE m_object_collection (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('OBJECT_COLLECTION') STORED
        CHECK (objectType = 'OBJECT_COLLECTION')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_object_collection_oid_insert_tr BEFORE INSERT ON m_object_collection
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_object_collection_update_tr BEFORE UPDATE ON m_object_collection
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_object_collection_oid_delete_tr AFTER DELETE ON m_object_collection
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_object_collection_nameOrig_idx ON m_object_collection (nameOrig);
CREATE UNIQUE INDEX m_object_collection_nameNorm_key ON m_object_collection (nameNorm);
CREATE INDEX m_object_collection_subtypes_idx ON m_object_collection USING gin(subtypes);
CREATE INDEX m_object_collection_policySituation_idx
    ON m_object_collection USING gin(policysituations gin__int_ops);
CREATE INDEX m_object_collection_fullTextInfo_idx
    ON m_object_collection USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_object_collection_createTimestamp_idx ON m_object_collection (createTimestamp);
CREATE INDEX m_object_collection_modifyTimestamp_idx ON m_object_collection (modifyTimestamp);

-- Represents DashboardType, see https://docs.evolveum.com/midpoint/reference/admin-gui/dashboards/configuration/
CREATE TABLE m_dashboard (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('DASHBOARD') STORED
        CHECK (objectType = 'DASHBOARD')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_dashboard_oid_insert_tr BEFORE INSERT ON m_dashboard
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_dashboard_update_tr BEFORE UPDATE ON m_dashboard
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_dashboard_oid_delete_tr AFTER DELETE ON m_dashboard
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_dashboard_nameOrig_idx ON m_dashboard (nameOrig);
CREATE UNIQUE INDEX m_dashboard_nameNorm_key ON m_dashboard (nameNorm);
CREATE INDEX m_dashboard_subtypes_idx ON m_dashboard USING gin(subtypes);
CREATE INDEX m_dashboard_policySituation_idx
    ON m_dashboard USING gin(policysituations gin__int_ops);
CREATE INDEX m_dashboard_createTimestamp_idx ON m_dashboard (createTimestamp);
CREATE INDEX m_dashboard_modifyTimestamp_idx ON m_dashboard (modifyTimestamp);

-- Represents ValuePolicyType
CREATE TABLE m_value_policy (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('VALUE_POLICY') STORED
        CHECK (objectType = 'VALUE_POLICY')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_value_policy_oid_insert_tr BEFORE INSERT ON m_value_policy
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_value_policy_update_tr BEFORE UPDATE ON m_value_policy
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_value_policy_oid_delete_tr AFTER DELETE ON m_value_policy
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_value_policy_nameOrig_idx ON m_value_policy (nameOrig);
CREATE UNIQUE INDEX m_value_policy_nameNorm_key ON m_value_policy (nameNorm);
CREATE INDEX m_value_policy_subtypes_idx ON m_value_policy USING gin(subtypes);
CREATE INDEX m_value_policy_policySituation_idx
    ON m_value_policy USING gin(policysituations gin__int_ops);
CREATE INDEX m_value_policy_createTimestamp_idx ON m_value_policy (createTimestamp);
CREATE INDEX m_value_policy_modifyTimestamp_idx ON m_value_policy (modifyTimestamp);

-- Represents ReportType, see https://docs.evolveum.com/midpoint/reference/misc/reports/report-configuration/
CREATE TABLE m_report (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('REPORT') STORED
        CHECK (objectType = 'REPORT')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_report_oid_insert_tr BEFORE INSERT ON m_report
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_report_update_tr BEFORE UPDATE ON m_report
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_report_oid_delete_tr AFTER DELETE ON m_report
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_report_nameOrig_idx ON m_report (nameOrig);
CREATE UNIQUE INDEX m_report_nameNorm_key ON m_report (nameNorm);
CREATE INDEX m_report_subtypes_idx ON m_report USING gin(subtypes);
CREATE INDEX m_report_policySituation_idx ON m_report USING gin(policysituations gin__int_ops);
CREATE INDEX m_report_createTimestamp_idx ON m_report (createTimestamp);
CREATE INDEX m_report_modifyTimestamp_idx ON m_report (modifyTimestamp);

-- Represents ReportDataType, see also m_report above
CREATE TABLE m_report_data (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('REPORT_DATA') STORED
        CHECK (objectType = 'REPORT_DATA'),
    reportRefTargetOid UUID,
    reportRefTargetType ObjectType,
    reportRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_report_data_oid_insert_tr BEFORE INSERT ON m_report_data
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_report_data_update_tr BEFORE UPDATE ON m_report_data
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_report_data_oid_delete_tr AFTER DELETE ON m_report_data
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_report_data_nameOrig_idx ON m_report_data (nameOrig);
CREATE INDEX m_report_data_nameNorm_idx ON m_report_data (nameNorm); -- not unique
CREATE INDEX m_report_data_subtypes_idx ON m_report_data USING gin(subtypes);
CREATE INDEX m_report_data_policySituation_idx
    ON m_report_data USING gin(policysituations gin__int_ops);
CREATE INDEX m_report_data_createTimestamp_idx ON m_report_data (createTimestamp);
CREATE INDEX m_report_data_modifyTimestamp_idx ON m_report_data (modifyTimestamp);


CREATE TABLE m_role_analysis_cluster (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_CLUSTER') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_CLUSTER'),
        parentRefTargetOid UUID,
        parentRefTargetType ObjectType,
        parentRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_cluster_oid_insert_tr BEFORE INSERT ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_cluster_update_tr BEFORE UPDATE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_cluster_oid_delete_tr AFTER DELETE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_role_analysis_cluster_parentRefTargetOid_idx ON m_role_analysis_cluster (parentRefTargetOid);
CREATE INDEX m_role_analysis_cluster_parentRefTargetType_idx ON m_role_analysis_cluster (parentRefTargetType);
CREATE INDEX m_role_analysis_cluster_parentRefRelationId_idx ON m_role_analysis_cluster (parentRefRelationId);


CREATE TABLE m_role_analysis_session (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_SESSION') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_SESSION')
        )
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_session_oid_insert_tr BEFORE INSERT ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_session_update_tr BEFORE UPDATE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_session_oid_delete_tr AFTER DELETE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();



-- Represents LookupTableType, see https://docs.evolveum.com/midpoint/reference/misc/lookup-tables/
CREATE TABLE m_lookup_table (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('LOOKUP_TABLE') STORED
        CHECK (objectType = 'LOOKUP_TABLE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_lookup_table_oid_insert_tr BEFORE INSERT ON m_lookup_table
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_lookup_table_update_tr BEFORE UPDATE ON m_lookup_table
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_lookup_table_oid_delete_tr AFTER DELETE ON m_lookup_table
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_lookup_table_nameOrig_idx ON m_lookup_table (nameOrig);
CREATE UNIQUE INDEX m_lookup_table_nameNorm_key ON m_lookup_table (nameNorm);
CREATE INDEX m_lookup_table_subtypes_idx ON m_lookup_table USING gin(subtypes);
CREATE INDEX m_lookup_table_policySituation_idx
    ON m_lookup_table USING gin(policysituations gin__int_ops);
CREATE INDEX m_lookup_table_createTimestamp_idx ON m_lookup_table (createTimestamp);
CREATE INDEX m_lookup_table_modifyTimestamp_idx ON m_lookup_table (modifyTimestamp);

-- Represents LookupTableRowType, see also m_lookup_table above
CREATE TABLE m_lookup_table_row (
    ownerOid UUID NOT NULL REFERENCES m_lookup_table(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('LOOKUP_TABLE_ROW') STORED
        CHECK (containerType = 'LOOKUP_TABLE_ROW'),
    key TEXT,
    value TEXT,
    labelOrig TEXT,
    labelNorm TEXT,
    lastChangeTimestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE UNIQUE INDEX m_lookup_table_row_ownerOid_key_key ON m_lookup_table_row (ownerOid, key);

-- Represents ConnectorType, see https://docs.evolveum.com/connectors/connectors/
CREATE TABLE m_connector (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('CONNECTOR') STORED
        CHECK (objectType = 'CONNECTOR'),
    connectorBundle TEXT, -- typically a package name
    connectorType TEXT NOT NULL, -- typically a class name
    connectorVersion TEXT NOT NULL,
    frameworkId INTEGER REFERENCES m_uri(id),
    connectorHostRefTargetOid UUID,
    connectorHostRefTargetType ObjectType,
    connectorHostRefRelationId INTEGER REFERENCES m_uri(id),
    displayNameOrig TEXT,
    displayNameNorm TEXT,
    targetSystemTypes INTEGER[],
    available BOOLEAN
)
    INHERITS (m_assignment_holder);





CREATE TRIGGER m_connector_oid_insert_tr BEFORE INSERT ON m_connector
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_connector_update_tr BEFORE UPDATE ON m_connector
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_connector_oid_delete_tr AFTER DELETE ON m_connector
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE UNIQUE INDEX m_connector_typeVersion_key
    ON m_connector (connectorType, connectorVersion)
    WHERE connectorHostRefTargetOid IS NULL;
CREATE UNIQUE INDEX m_connector_typeVersionHost_key
    ON m_connector (connectorType, connectorVersion, connectorHostRefTargetOid)
    WHERE connectorHostRefTargetOid IS NOT NULL;
CREATE INDEX m_connector_nameOrig_idx ON m_connector (nameOrig);
CREATE INDEX m_connector_nameNorm_idx ON m_connector (nameNorm);
CREATE INDEX m_connector_subtypes_idx ON m_connector USING gin(subtypes);
CREATE INDEX m_connector_policySituation_idx
    ON m_connector USING gin(policysituations gin__int_ops);
CREATE INDEX m_connector_createTimestamp_idx ON m_connector (createTimestamp);
CREATE INDEX m_connector_modifyTimestamp_idx ON m_connector (modifyTimestamp);

-- Represents ConnectorHostType, see https://docs.evolveum.com/connectors/connid/1.x/connector-server/
CREATE TABLE m_connector_host (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('CONNECTOR_HOST') STORED
        CHECK (objectType = 'CONNECTOR_HOST'),
    hostname TEXT,
    port TEXT
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_connector_host_oid_insert_tr BEFORE INSERT ON m_connector_host
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_connector_host_update_tr BEFORE UPDATE ON m_connector_host
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_connector_host_oid_delete_tr AFTER DELETE ON m_connector_host
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_connector_host_nameOrig_idx ON m_connector_host (nameOrig);
CREATE UNIQUE INDEX m_connector_host_nameNorm_key ON m_connector_host (nameNorm);
CREATE INDEX m_connector_host_subtypes_idx ON m_connector_host USING gin(subtypes);
CREATE INDEX m_connector_host_policySituation_idx
    ON m_connector_host USING gin(policysituations gin__int_ops);
CREATE INDEX m_connector_host_createTimestamp_idx ON m_connector_host (createTimestamp);
CREATE INDEX m_connector_host_modifyTimestamp_idx ON m_connector_host (modifyTimestamp);

-- Represents persistent TaskType, see https://docs.evolveum.com/midpoint/reference/tasks/task-manager/
CREATE TABLE m_task (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('TASK') STORED
        CHECK (objectType = 'TASK'),
    taskIdentifier TEXT,
    binding TaskBindingType,
    category TEXT, -- TODO revise, deprecated, probably can go away soon
    completionTimestamp TIMESTAMPTZ,
    executionState TaskExecutionStateType,
    -- Logically fullResult and resultStatus are related, managed by Task manager.
    fullResult BYTEA,
    resultStatus OperationResultStatusType,
    handlerUriId INTEGER REFERENCES m_uri(id),
    lastRunStartTimestamp TIMESTAMPTZ,
    lastRunFinishTimestamp TIMESTAMPTZ,
    node TEXT, -- nodeId only for information purposes
    objectRefTargetOid UUID,
    objectRefTargetType ObjectType,
    objectRefRelationId INTEGER REFERENCES m_uri(id),
    ownerRefTargetOid UUID,
    ownerRefTargetType ObjectType,
    ownerRefRelationId INTEGER REFERENCES m_uri(id),
    parent TEXT, -- value of taskIdentifier
    recurrence TaskRecurrenceType,
    schedulingState TaskSchedulingStateType,
    autoScalingMode TaskAutoScalingModeType, -- autoScaling/mode
    threadStopAction ThreadStopActionType,
    waitingReason TaskWaitingReasonType,
    dependentTaskIdentifiers TEXT[] -- contains values of taskIdentifier
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_task_oid_insert_tr BEFORE INSERT ON m_task
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_task_update_tr BEFORE UPDATE ON m_task
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_task_oid_delete_tr AFTER DELETE ON m_task
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_task_nameOrig_idx ON m_task (nameOrig);
CREATE INDEX m_task_nameNorm_idx ON m_task (nameNorm); -- can have duplicates
CREATE INDEX m_task_parent_idx ON m_task (parent);
CREATE INDEX m_task_objectRefTargetOid_idx ON m_task(objectRefTargetOid);
CREATE UNIQUE INDEX m_task_taskIdentifier_key ON m_task (taskIdentifier);
CREATE INDEX m_task_dependentTaskIdentifiers_idx ON m_task USING gin(dependentTaskIdentifiers);
CREATE INDEX m_task_subtypes_idx ON m_task USING gin(subtypes);
CREATE INDEX m_task_policySituation_idx ON m_task USING gin(policysituations gin__int_ops);
CREATE INDEX m_task_ext_idx ON m_task USING gin(ext);
CREATE INDEX m_task_fullTextInfo_idx ON m_task USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_task_createTimestamp_idx ON m_task (createTimestamp);
CREATE INDEX m_task_modifyTimestamp_idx ON m_task (modifyTimestamp);

CREATE TABLE m_task_affected_objects (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('AFFECTED_OBJECTS') STORED
     CHECK (containerType = 'AFFECTED_OBJECTS'),
    activityId INTEGER REFERENCES m_uri(id),
    type ObjectType,
    archetypeRefTargetOid UUID,
    archetypeRefTargetType ObjectType,
    archetypeRefRelationId INTEGER REFERENCES m_uri(id),
    objectClassId INTEGER REFERENCES m_uri(id),
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    intent TEXT,
    kind ShadowKindType,
    executionMode ExecutionModeType,
    predefinedConfigurationToUse PredefinedConfigurationType,
    PRIMARY KEY (ownerOid, cid)
) INHERITS(m_container);

-- endregion

-- region cases
-- Represents CaseType, see https://docs.evolveum.com/midpoint/features/planned/case-management/
CREATE TABLE m_case (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('CASE') STORED
        CHECK (objectType = 'CASE'),
    state TEXT,
    closeTimestamp TIMESTAMPTZ,
    objectRefTargetOid UUID,
    objectRefTargetType ObjectType,
    objectRefRelationId INTEGER REFERENCES m_uri(id),
    parentRefTargetOid UUID,
    parentRefTargetType ObjectType,
    parentRefRelationId INTEGER REFERENCES m_uri(id),
    requestorRefTargetOid UUID,
    requestorRefTargetType ObjectType,
    requestorRefRelationId INTEGER REFERENCES m_uri(id),
    targetRefTargetOid UUID,
    targetRefTargetType ObjectType,
    targetRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_case_oid_insert_tr BEFORE INSERT ON m_case
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_case_update_tr BEFORE UPDATE ON m_case
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_case_oid_delete_tr AFTER DELETE ON m_case
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_case_nameOrig_idx ON m_case (nameOrig);
CREATE INDEX m_case_nameNorm_idx ON m_case (nameNorm);
CREATE INDEX m_case_subtypes_idx ON m_case USING gin(subtypes);
CREATE INDEX m_case_policySituation_idx ON m_case USING gin(policysituations gin__int_ops);
CREATE INDEX m_case_fullTextInfo_idx ON m_case USING gin(fullTextInfo gin_trgm_ops);

CREATE INDEX m_case_objectRefTargetOid_idx ON m_case(objectRefTargetOid);
CREATE INDEX m_case_targetRefTargetOid_idx ON m_case(targetRefTargetOid);
CREATE INDEX m_case_parentRefTargetOid_idx ON m_case(parentRefTargetOid);
CREATE INDEX m_case_requestorRefTargetOid_idx ON m_case(requestorRefTargetOid);
CREATE INDEX m_case_closeTimestamp_idx ON m_case(closeTimestamp);
CREATE INDEX m_case_createTimestamp_idx ON m_case (createTimestamp);
CREATE INDEX m_case_modifyTimestamp_idx ON m_case (modifyTimestamp);

CREATE TABLE m_case_wi (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('CASE_WORK_ITEM') STORED
        CHECK (containerType = 'CASE_WORK_ITEM'),
    closeTimestamp TIMESTAMPTZ,
    createTimestamp TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    originalAssigneeRefTargetOid UUID,
    originalAssigneeRefTargetType ObjectType,
    originalAssigneeRefRelationId INTEGER REFERENCES m_uri(id),
    outcome TEXT, -- stores workitem/output/outcome
    performerRefTargetOid UUID,
    performerRefTargetType ObjectType,
    performerRefRelationId INTEGER REFERENCES m_uri(id),
    stageNumber INTEGER,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_case_wi_createTimestamp_idx ON m_case_wi (createTimestamp);
CREATE INDEX m_case_wi_closeTimestamp_idx ON m_case_wi (closeTimestamp);
CREATE INDEX m_case_wi_deadline_idx ON m_case_wi (deadline);
CREATE INDEX m_case_wi_originalAssigneeRefTargetOid_idx ON m_case_wi (originalAssigneeRefTargetOid);
CREATE INDEX m_case_wi_performerRefTargetOid_idx ON m_case_wi (performerRefTargetOid);

-- stores workItem/assigneeRef
CREATE TABLE m_case_wi_assignee (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    workItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('CASE_WI_ASSIGNEE') STORED,

    PRIMARY KEY (ownerOid, workItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first three PK columns
ALTER TABLE m_case_wi_assignee ADD CONSTRAINT m_case_wi_assignee_id_fk
    FOREIGN KEY (ownerOid, workItemCid) REFERENCES m_case_wi (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_case_wi_assignee_targetOidRelationId_idx
    ON m_case_wi_assignee (targetOid, relationId);

-- stores workItem/candidateRef
CREATE TABLE m_case_wi_candidate (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    workItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('CASE_WI_CANDIDATE') STORED,

    PRIMARY KEY (ownerOid, workItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns
ALTER TABLE m_case_wi_candidate ADD CONSTRAINT m_case_wi_candidate_id_fk
    FOREIGN KEY (ownerOid, workItemCid) REFERENCES m_case_wi (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_case_wi_candidate_targetOidRelationId_idx
    ON m_case_wi_candidate (targetOid, relationId);
-- endregion

-- region Access Certification object tables
-- Represents AccessCertificationDefinitionType, see https://docs.evolveum.com/midpoint/reference/roles-policies/certification/
CREATE TABLE m_access_cert_definition (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_DEFINITION') STORED
        CHECK (objectType = 'ACCESS_CERTIFICATION_DEFINITION'),
    handlerUriId INTEGER REFERENCES m_uri(id),
    lastCampaignStartedTimestamp TIMESTAMPTZ,
    lastCampaignClosedTimestamp TIMESTAMPTZ,
    ownerRefTargetOid UUID,
    ownerRefTargetType ObjectType,
    ownerRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_access_cert_definition_oid_insert_tr BEFORE INSERT ON m_access_cert_definition
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_access_cert_definition_update_tr BEFORE UPDATE ON m_access_cert_definition
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_access_cert_definition_oid_delete_tr AFTER DELETE ON m_access_cert_definition
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_access_cert_definition_nameOrig_idx ON m_access_cert_definition (nameOrig);
CREATE UNIQUE INDEX m_access_cert_definition_nameNorm_key ON m_access_cert_definition (nameNorm);
CREATE INDEX m_access_cert_definition_subtypes_idx ON m_access_cert_definition USING gin(subtypes);
CREATE INDEX m_access_cert_definition_policySituation_idx
    ON m_access_cert_definition USING gin(policysituations gin__int_ops);
CREATE INDEX m_access_cert_definition_ext_idx ON m_access_cert_definition USING gin(ext);
CREATE INDEX m_access_cert_definition_fullTextInfo_idx
    ON m_access_cert_definition USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_access_cert_definition_createTimestamp_idx ON m_access_cert_definition (createTimestamp);
CREATE INDEX m_access_cert_definition_modifyTimestamp_idx ON m_access_cert_definition (modifyTimestamp);

CREATE TABLE m_access_cert_campaign (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_CAMPAIGN') STORED
        CHECK (objectType = 'ACCESS_CERTIFICATION_CAMPAIGN'),
    definitionRefTargetOid UUID,
    definitionRefTargetType ObjectType,
    definitionRefRelationId INTEGER REFERENCES m_uri(id),
    endTimestamp TIMESTAMPTZ,
    handlerUriId INTEGER REFERENCES m_uri(id),
    campaignIteration INTEGER NOT NULL,
    ownerRefTargetOid UUID,
    ownerRefTargetType ObjectType,
    ownerRefRelationId INTEGER REFERENCES m_uri(id),
    stageNumber INTEGER,
    startTimestamp TIMESTAMPTZ,
    state AccessCertificationCampaignStateType
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_access_cert_campaign_oid_insert_tr BEFORE INSERT ON m_access_cert_campaign
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_access_cert_campaign_update_tr BEFORE UPDATE ON m_access_cert_campaign
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_access_cert_campaign_oid_delete_tr AFTER DELETE ON m_access_cert_campaign
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_access_cert_campaign_nameOrig_idx ON m_access_cert_campaign (nameOrig);
CREATE UNIQUE INDEX m_access_cert_campaign_nameNorm_key ON m_access_cert_campaign (nameNorm);
CREATE INDEX m_access_cert_campaign_subtypes_idx ON m_access_cert_campaign USING gin(subtypes);
CREATE INDEX m_access_cert_campaign_policySituation_idx
    ON m_access_cert_campaign USING gin(policysituations gin__int_ops);
CREATE INDEX m_access_cert_campaign_ext_idx ON m_access_cert_campaign USING gin(ext);
CREATE INDEX m_access_cert_campaign_fullTextInfo_idx
    ON m_access_cert_campaign USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_access_cert_campaign_createTimestamp_idx ON m_access_cert_campaign (createTimestamp);
CREATE INDEX m_access_cert_campaign_modifyTimestamp_idx ON m_access_cert_campaign (modifyTimestamp);

CREATE TABLE m_access_cert_case (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_CASE') STORED
        CHECK (containerType = 'ACCESS_CERTIFICATION_CASE'),
    administrativeStatus ActivationStatusType,
    archiveTimestamp TIMESTAMPTZ,
    disableReason TEXT,
    disableTimestamp TIMESTAMPTZ,
    effectiveStatus ActivationStatusType,
    enableTimestamp TIMESTAMPTZ,
    validFrom TIMESTAMPTZ,
    validTo TIMESTAMPTZ,
    validityChangeTimestamp TIMESTAMPTZ,
    validityStatus TimeIntervalStatusType,
    currentStageOutcome TEXT,
    fullObject BYTEA,
    campaignIteration INTEGER NOT NULL,
    objectRefTargetOid UUID,
    objectRefTargetType ObjectType,
    objectRefRelationId INTEGER REFERENCES m_uri(id),
    orgRefTargetOid UUID,
    orgRefTargetType ObjectType,
    orgRefRelationId INTEGER REFERENCES m_uri(id),
    outcome TEXT,
    remediedTimestamp TIMESTAMPTZ,
    currentStageDeadline TIMESTAMPTZ,
    currentStageCreateTimestamp TIMESTAMPTZ,
    stageNumber INTEGER,
    targetRefTargetOid UUID,
    targetRefTargetType ObjectType,
    targetRefRelationId INTEGER REFERENCES m_uri(id),
    tenantRefTargetOid UUID,
    tenantRefTargetType ObjectType,
    tenantRefRelationId INTEGER REFERENCES m_uri(id),

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_access_cert_case_objectRefTargetOid_idx ON m_access_cert_case (objectRefTargetOid);
CREATE INDEX m_access_cert_case_targetRefTargetOid_idx ON m_access_cert_case (targetRefTargetOid);
CREATE INDEX m_access_cert_case_tenantRefTargetOid_idx ON m_access_cert_case (tenantRefTargetOid);
CREATE INDEX m_access_cert_case_orgRefTargetOid_idx ON m_access_cert_case (orgRefTargetOid);

CREATE TABLE m_access_cert_wi (
    ownerOid UUID NOT NULL, -- PK+FK
    accessCertCaseCid INTEGER NOT NULL, -- PK+FK
    containerType ContainerType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_WORK_ITEM') STORED
        CHECK (containerType = 'ACCESS_CERTIFICATION_WORK_ITEM'),
    closeTimestamp TIMESTAMPTZ,
    campaignIteration INTEGER NOT NULL,
    outcome TEXT, -- stores output/outcome
    outputChangeTimestamp TIMESTAMPTZ,
    performerRefTargetOid UUID,
    performerRefTargetType ObjectType,
    performerRefRelationId INTEGER REFERENCES m_uri(id),
    stageNumber INTEGER,

    PRIMARY KEY (ownerOid, accessCertCaseCid, cid)
)
    INHERITS(m_container);

-- indexed by first two PK columns
ALTER TABLE m_access_cert_wi
    ADD CONSTRAINT m_access_cert_wi_id_fk FOREIGN KEY (ownerOid, accessCertCaseCid)
        REFERENCES m_access_cert_case (ownerOid, cid)
        ON DELETE CASCADE;

-- stores case/workItem/assigneeRef
CREATE TABLE m_access_cert_wi_assignee (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    accessCertCaseCid INTEGER NOT NULL,
    accessCertWorkItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ACCESS_CERT_WI_ASSIGNEE') STORED,

    PRIMARY KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns, TODO: isn't this one superfluous with the next one?
ALTER TABLE m_access_cert_wi_assignee ADD CONSTRAINT m_access_cert_wi_assignee_id_fk_case
    FOREIGN KEY (ownerOid, accessCertCaseCid) REFERENCES m_access_cert_case (ownerOid, cid)
        ON DELETE CASCADE;

-- indexed by first three PK columns
ALTER TABLE m_access_cert_wi_assignee ADD CONSTRAINT m_access_cert_wi_assignee_id_fk_wi
    FOREIGN KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid)
        REFERENCES m_access_cert_wi (ownerOid, accessCertCaseCid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_access_cert_wi_assignee_targetOidRelationId_idx
    ON m_access_cert_wi_assignee (targetOid, relationId);

-- stores case/workItem/candidateRef
CREATE TABLE m_access_cert_wi_candidate (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    accessCertCaseCid INTEGER NOT NULL,
    accessCertWorkItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ACCESS_CERT_WI_CANDIDATE') STORED,

    PRIMARY KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns, TODO: isn't this one superfluous with the next one?
ALTER TABLE m_access_cert_wi_candidate ADD CONSTRAINT m_access_cert_wi_candidate_id_fk_case
    FOREIGN KEY (ownerOid, accessCertCaseCid) REFERENCES m_access_cert_case (ownerOid, cid)
        ON DELETE CASCADE;

-- indexed by first three PK columns
ALTER TABLE m_access_cert_wi_candidate ADD CONSTRAINT m_access_cert_wi_candidate_id_fk_wi
    FOREIGN KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid)
        REFERENCES m_access_cert_wi (ownerOid, accessCertCaseCid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_access_cert_wi_candidate_targetOidRelationId_idx
    ON m_access_cert_wi_candidate (targetOid, relationId);
-- endregion

-- region ObjectTemplateType
CREATE TABLE m_object_template (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('OBJECT_TEMPLATE') STORED
        CHECK (objectType = 'OBJECT_TEMPLATE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_object_template_oid_insert_tr BEFORE INSERT ON m_object_template
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_object_template_update_tr BEFORE UPDATE ON m_object_template
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_object_template_oid_delete_tr AFTER DELETE ON m_object_template
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_object_template_nameOrig_idx ON m_object_template (nameOrig);
CREATE UNIQUE INDEX m_object_template_nameNorm_key ON m_object_template (nameNorm);
CREATE INDEX m_object_template_subtypes_idx ON m_object_template USING gin(subtypes);
CREATE INDEX m_object_template_policySituation_idx
    ON m_object_template USING gin(policysituations gin__int_ops);
CREATE INDEX m_object_template_createTimestamp_idx ON m_object_template (createTimestamp);
CREATE INDEX m_object_template_modifyTimestamp_idx ON m_object_template (modifyTimestamp);

-- stores ObjectTemplateType/includeRef
CREATE TABLE m_ref_include (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('INCLUDE') STORED
        CHECK (referenceType = 'INCLUDE'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_include_targetOidRelationId_idx
    ON m_ref_include (targetOid, relationId);
-- endregion

-- region FunctionLibrary/Sequence/Form tables
-- Represents FunctionLibraryType, see https://docs.evolveum.com/midpoint/reference/expressions/function-libraries/
CREATE TABLE m_function_library (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('FUNCTION_LIBRARY') STORED
        CHECK (objectType = 'FUNCTION_LIBRARY')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_function_library_oid_insert_tr BEFORE INSERT ON m_function_library
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_function_library_update_tr BEFORE UPDATE ON m_function_library
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_function_library_oid_delete_tr AFTER DELETE ON m_function_library
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_function_library_nameOrig_idx ON m_function_library (nameOrig);
CREATE UNIQUE INDEX m_function_library_nameNorm_key ON m_function_library (nameNorm);
CREATE INDEX m_function_library_subtypes_idx ON m_function_library USING gin(subtypes);
CREATE INDEX m_function_library_policySituation_idx
    ON m_function_library USING gin(policysituations gin__int_ops);

-- Represents SequenceType, see https://docs.evolveum.com/midpoint/reference/expressions/sequences/
CREATE TABLE m_sequence (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SEQUENCE') STORED
        CHECK (objectType = 'SEQUENCE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_sequence_oid_insert_tr BEFORE INSERT ON m_sequence
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_sequence_update_tr BEFORE UPDATE ON m_sequence
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_sequence_oid_delete_tr AFTER DELETE ON m_sequence
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_sequence_nameOrig_idx ON m_sequence (nameOrig);
CREATE UNIQUE INDEX m_sequence_nameNorm_key ON m_sequence (nameNorm);
CREATE INDEX m_sequence_subtypes_idx ON m_sequence USING gin(subtypes);
CREATE INDEX m_sequence_policySituation_idx ON m_sequence USING gin(policysituations gin__int_ops);
CREATE INDEX m_sequence_createTimestamp_idx ON m_sequence (createTimestamp);
CREATE INDEX m_sequence_modifyTimestamp_idx ON m_sequence (modifyTimestamp);

-- Represents FormType, see https://docs.evolveum.com/midpoint/reference/admin-gui/custom-forms/
CREATE TABLE m_form (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('FORM') STORED
        CHECK (objectType = 'FORM')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_form_oid_insert_tr BEFORE INSERT ON m_form
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_form_update_tr BEFORE UPDATE ON m_form
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_form_oid_delete_tr AFTER DELETE ON m_form
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_form_nameOrig_idx ON m_form (nameOrig);
CREATE UNIQUE INDEX m_form_nameNorm_key ON m_form (nameNorm);
CREATE INDEX m_form_subtypes_idx ON m_form USING gin(subtypes);
CREATE INDEX m_form_policySituation_idx ON m_form USING gin(policysituations gin__int_ops);
CREATE INDEX m_form_createTimestamp_idx ON m_form (createTimestamp);
CREATE INDEX m_form_modifyTimestamp_idx ON m_form (modifyTimestamp);
-- endregion

-- region Notification and message transport
-- Represents MessageTemplateType
CREATE TABLE m_message_template (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MESSAGE_TEMPLATE') STORED
        CHECK (objectType = 'MESSAGE_TEMPLATE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_message_template_oid_insert_tr BEFORE INSERT ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_message_template_update_tr BEFORE UPDATE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_message_template_oid_delete_tr AFTER DELETE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_message_template_nameOrig_idx ON m_message_template (nameOrig);
CREATE UNIQUE INDEX m_message_template_nameNorm_key ON m_message_template (nameNorm);
CREATE INDEX m_message_template_policySituation_idx
    ON m_message_template USING gin(policysituations gin__int_ops);
CREATE INDEX m_message_template_createTimestamp_idx ON m_message_template (createTimestamp);
CREATE INDEX m_message_template_modifyTimestamp_idx ON m_message_template (modifyTimestamp);
-- endregion

-- region Assignment/Inducement table
-- Represents AssignmentType, see https://docs.evolveum.com/midpoint/reference/roles-policies/assignment/
-- and also https://docs.evolveum.com/midpoint/reference/roles-policies/assignment/assignment-vs-inducement/
CREATE TABLE m_assignment (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    -- this is different from other containers, this is not generated, app must provide it
    containerType ContainerType NOT NULL CHECK (containerType IN ('ASSIGNMENT', 'INDUCEMENT')),
    ownerType ObjectType NOT NULL,
    lifecycleState TEXT,
    orderValue INTEGER, -- item "order"
    orgRefTargetOid UUID,
    orgRefTargetType ObjectType,
    orgRefRelationId INTEGER REFERENCES m_uri(id),
    targetRefTargetOid UUID,
    targetRefTargetType ObjectType,
    targetRefRelationId INTEGER REFERENCES m_uri(id),
    tenantRefTargetOid UUID,
    tenantRefTargetType ObjectType,
    tenantRefRelationId INTEGER REFERENCES m_uri(id),
    policySituations INTEGER[], -- soft-references m_uri, add index per table
    subtypes TEXT[], -- only EQ filter
    ext JSONB,
    -- construction
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    -- activation
    administrativeStatus ActivationStatusType,
    effectiveStatus ActivationStatusType,
    enableTimestamp TIMESTAMPTZ,
    disableTimestamp TIMESTAMPTZ,
    disableReason TEXT,
    validityStatus TimeIntervalStatusType,
    validFrom TIMESTAMPTZ,
    validTo TIMESTAMPTZ,
    validityChangeTimestamp TIMESTAMPTZ,
    archiveTimestamp TIMESTAMPTZ,
    -- metadata
    creatorRefTargetOid UUID,
    creatorRefTargetType ObjectType,
    creatorRefRelationId INTEGER REFERENCES m_uri(id),
    createChannelId INTEGER REFERENCES m_uri(id),
    createTimestamp TIMESTAMPTZ,
    modifierRefTargetOid UUID,
    modifierRefTargetType ObjectType,
    modifierRefRelationId INTEGER REFERENCES m_uri(id),
    modifyChannelId INTEGER REFERENCES m_uri(id),
    modifyTimestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
);

CREATE INDEX m_assignment_policySituation_idx
    ON m_assignment USING gin(policysituations gin__int_ops);
CREATE INDEX m_assignment_subtypes_idx ON m_assignment USING gin(subtypes);
CREATE INDEX m_assignment_ext_idx ON m_assignment USING gin(ext);
-- TODO was: CREATE INDEX iAssignmentAdministrative ON m_assignment (administrativeStatus);
-- administrativeStatus has 3 states (ENABLED/DISABLED/ARCHIVED), not sure it's worth indexing
-- but it can be used as a condition to index other (e.g. WHERE administrativeStatus='ENABLED')
-- TODO the same: CREATE INDEX iAssignmentEffective ON m_assignment (effectiveStatus);
CREATE INDEX m_assignment_validFrom_idx ON m_assignment (validFrom);
CREATE INDEX m_assignment_validTo_idx ON m_assignment (validTo);
CREATE INDEX m_assignment_targetRefTargetOid_idx ON m_assignment (targetRefTargetOid);
CREATE INDEX m_assignment_tenantRefTargetOid_idx ON m_assignment (tenantRefTargetOid);
CREATE INDEX m_assignment_orgRefTargetOid_idx ON m_assignment (orgRefTargetOid);
CREATE INDEX m_assignment_resourceRefTargetOid_idx ON m_assignment (resourceRefTargetOid);
CREATE INDEX m_assignment_createTimestamp_idx ON m_assignment (createTimestamp);
CREATE INDEX m_assignment_modifyTimestamp_idx ON m_assignment (modifyTimestamp);

-- stores assignment/metadata/createApproverRef
CREATE TABLE m_assignment_ref_create_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    assignmentCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ASSIGNMENT_CREATE_APPROVER') STORED
        CHECK (referenceType = 'ASSIGNMENT_CREATE_APPROVER'),

    PRIMARY KEY (ownerOid, assignmentCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns
ALTER TABLE m_assignment_ref_create_approver ADD CONSTRAINT m_assignment_ref_create_approver_id_fk
    FOREIGN KEY (ownerOid, assignmentCid) REFERENCES m_assignment (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_assignment_ref_create_approver_targetOidRelationId_idx
    ON m_assignment_ref_create_approver (targetOid, relationId);

-- stores assignment/metadata/modifyApproverRef
CREATE TABLE m_assignment_ref_modify_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    assignmentCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ASSIGNMENT_MODIFY_APPROVER') STORED
        CHECK (referenceType = 'ASSIGNMENT_MODIFY_APPROVER'),

    PRIMARY KEY (ownerOid, assignmentCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first three PK columns
ALTER TABLE m_assignment_ref_modify_approver ADD CONSTRAINT m_assignment_ref_modify_approver_id_fk
    FOREIGN KEY (ownerOid, assignmentCid) REFERENCES m_assignment (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_assignment_ref_modify_approver_targetOidRelationId_idx
    ON m_assignment_ref_modify_approver (targetOid, relationId);
-- endregion

-- region Other object containers
-- stores ObjectType/trigger (TriggerType)
CREATE TABLE m_trigger (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('TRIGGER') STORED
        CHECK (containerType = 'TRIGGER'),
    handlerUriId INTEGER REFERENCES m_uri(id),
    timestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_trigger_timestamp_idx ON m_trigger (timestamp);

-- stores ObjectType/operationExecution (OperationExecutionType)
CREATE TABLE m_operation_execution (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('OPERATION_EXECUTION') STORED
        CHECK (containerType = 'OPERATION_EXECUTION'),
    status OperationResultStatusType,
    recordType OperationExecutionRecordTypeType,
    initiatorRefTargetOid UUID,
    initiatorRefTargetType ObjectType,
    initiatorRefRelationId INTEGER REFERENCES m_uri(id),
    taskRefTargetOid UUID,
    taskRefTargetType ObjectType,
    taskRefRelationId INTEGER REFERENCES m_uri(id),
    timestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_operation_execution_initiatorRefTargetOid_idx
    ON m_operation_execution (initiatorRefTargetOid);
CREATE INDEX m_operation_execution_taskRefTargetOid_idx
    ON m_operation_execution (taskRefTargetOid);
CREATE INDEX m_operation_execution_timestamp_idx ON m_operation_execution (timestamp);
-- index for ownerOid is part of PK
-- TODO: index for status is questionable, don't we want WHERE status = ... to another index instead?
-- endregion


-- region Simulations Support

CREATE TABLE m_simulation_result (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED
        CHECK (objectType = 'SIMULATION_RESULT'),
    partitioned boolean,
    rootTaskRefTargetOid UUID,
    rootTaskRefTargetType ObjectType,
    rootTaskRefRelationId INTEGER REFERENCES m_uri(id),
    startTimestamp TIMESTAMPTZ,
    endTimestamp TIMESTAMPTZ
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_simulation_result_oid_insert_tr BEFORE INSERT ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_simulation_result_update_tr BEFORE UPDATE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_simulation_result_oid_delete_tr AFTER DELETE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE TYPE ObjectProcessingStateType AS ENUM ('UNMODIFIED', 'ADDED', 'MODIFIED', 'DELETED');

CREATE TABLE m_simulation_result_processed_object (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    -- Owner does not have to be the direct parent of the container.
    -- use like this on the concrete table:
    -- ownerOid UUID NOT NULL REFERENCES m_object_oid(oid),
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    containerType ContainerType GENERATED ALWAYS AS ('SIMULATION_RESULT_PROCESSED_OBJECT') STORED
        CHECK (containerType = 'SIMULATION_RESULT_PROCESSED_OBJECT'),
    oid UUID,
    objectType ObjectType,
    nameOrig TEXT,
    nameNorm TEXT,
    state ObjectProcessingStateType,
    metricIdentifiers TEXT[],
    fullObject BYTEA,
    objectBefore BYTEA,
    objectAfter BYTEA,
    transactionId TEXT,
    focusRecordId BIGINT,

   PRIMARY KEY (ownerOid, cid)
) PARTITION BY LIST(ownerOid);

CREATE TABLE m_simulation_result_processed_object_default PARTITION OF m_simulation_result_processed_object DEFAULT;

CREATE OR REPLACE FUNCTION m_simulation_result_create_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(new.oid::text,'-','_');
      IF new.partitioned AND NOT EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been created %',partition;
        EXECUTE 'CREATE TABLE ' || partition || ' partition of ' || 'm_simulation_result_processed_object' || ' for values in (''' || new.oid|| ''');';
      END IF;
      RETURN NULL;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_create_partition AFTER INSERT ON m_simulation_result
 FOR EACH ROW EXECUTE FUNCTION m_simulation_result_create_partition();

--- Trigger which deletes processed objects partition when whole simulation is deleted

CREATE OR REPLACE FUNCTION m_simulation_result_delete_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(OLD.oid::text,'-','_');
      IF OLD.partitioned AND EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been deleted %',partition;
        EXECUTE 'DROP TABLE IF EXISTS ' || partition || ';';
      END IF;
      RETURN OLD;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_delete_partition BEFORE DELETE ON m_simulation_result
  FOR EACH ROW EXECUTE FUNCTION m_simulation_result_delete_partition();



CREATE TABLE m_processed_object_event_mark (
  ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
  ownerType ObjectType, -- GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED,
  processedObjectCid INTEGER NOT NULL,
  referenceType ReferenceType GENERATED ALWAYS AS ('PROCESSED_OBJECT_EVENT_MARK') STORED,
  targetOid UUID NOT NULL, -- soft-references m_object
  targetType ObjectType NOT NULL,
  relationId INTEGER NOT NULL REFERENCES m_uri(id)

) PARTITION BY LIST(ownerOid);

CREATE TABLE m_processed_object_event_mark_default PARTITION OF m_processed_object_event_mark DEFAULT;

-- endregion

-- region Mark

CREATE TABLE m_mark (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MARK') STORED
        CHECK (objectType = 'MARK')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_mark_oid_insert_tr BEFORE INSERT ON m_mark
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_mark_update_tr BEFORE UPDATE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_mark_oid_delete_tr AFTER DELETE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();


-- endregion

-- region Extension support
-- Catalog table of known indexed extension items.
-- While itemName and valueType are both Q-names they are not cached via m_uri because this
-- table is small, itemName does not repeat (valueType does) and readability is also better.
-- This has similar function as m_uri - it translates something to IDs, no need to nest it.
CREATE TABLE m_ext_item (
    id SERIAL NOT NULL PRIMARY KEY,
    itemName TEXT NOT NULL,
    valueType TEXT NOT NULL,
    holderType ExtItemHolderType NOT NULL,
    cardinality ExtItemCardinality NOT NULL
    -- information about storage mechanism (JSON common/separate, column, table separate/common, etc.)
    -- storageType JSONB NOT NULL default '{"type": "EXT_JSON"}', -- currently only JSONB is used
);

-- This works fine for itemName+holderType search used in raw processing
CREATE UNIQUE INDEX m_ext_item_key ON m_ext_item (itemName, holderType, valueType, cardinality);
-- endregion

-- INDEXING:
-- More indexes is possible, but for low-variability columns like lifecycleState or administrative/effectiveStatus
-- better use them in WHERE as needed when slow query appear: https://www.postgresql.org/docs/current/indexes-partial.html
-- Also see: https://docs.evolveum.com/midpoint/reference/repository/native-postgresql/db-maintenance/

-- region Schema versioning and upgrading
/*
Procedure applying a DB schema/data change for main repository tables (audit has separate procedure).
Use sequential change numbers to identify the changes.
This protects re-execution of the same change on the same database instance.
Use dollar-quoted string constant for a change, examples are lower, docs here:
https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
The transaction is committed if the change is executed.
The change number is NOT semantic and uses different key than original 'databaseSchemaVersion'.
Semantic schema versioning is still possible, but now only for information purposes.

Example of an DB upgrade script (stuff between $$ can be multiline, here compressed for brevity):
CALL apply_change(1, $$ create table x(a int); insert into x values (1); $$);
CALL apply_change(2, $$ alter table x add column b text; insert into x values (2, 'two'); $$);
-- not a good idea in general, but "true" forces the execution; it never updates change # to lower
CALL apply_change(1, $$ insert into x values (3, 'three'); $$, true);
*/
CREATE OR REPLACE PROCEDURE apply_change(changeNumber int, change TEXT, force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    lastChange int;
BEGIN
    SELECT value INTO lastChange FROM m_global_metadata WHERE name = 'schemaChangeNumber';

    -- change is executed if the changeNumber is newer - or if forced
    IF lastChange IS NULL OR lastChange < changeNumber OR force THEN
        EXECUTE change;
        RAISE NOTICE 'Change #% executed!', changeNumber;

        IF lastChange IS NULL THEN
            INSERT INTO m_global_metadata (name, value) VALUES ('schemaChangeNumber', changeNumber);
        ELSIF changeNumber > lastChange THEN
            -- even with force we never want to set lower-or-equal change number, hence the IF above
            UPDATE m_global_metadata SET value = changeNumber WHERE name = 'schemaChangeNumber';
        ELSE
            RAISE NOTICE 'Last change number left unchanged: #%', lastChange;
        END IF;
        COMMIT;
    ELSE
        RAISE NOTICE 'Change #% skipped - not newer than the last change #%!', changeNumber, lastChange;
    END IF;
END $$;
-- endregion

-- Initializing the last change number used in postgres-new-upgrade.sql.
-- This is important to avoid applying any change more than once.
-- Also update SqaleUtils.CURRENT_SCHEMA_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java
call apply_change(25, $$ SELECT 1 $$, true);

```

## /Users/ddonahoe/code/midpoint/database/postgres-audit-upgrade.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- This is the update script for the AUDIT database.
-- If you use audit and main repository in a single database, this still must be run as well.
-- It is safe to run this script repeatedly, so if you're not sure, just run it to be up to date.

-- Using psql is strongly recommended, don't use tools with messy autocommit behavior like pgAdmin!
-- Using flag to stop on first error is also recommended, for example:
-- psql -v ON_ERROR_STOP=1 -h localhost -U midaudit -W -d midaudit -f postgres-new-upgrade-audit.sql

-- SCHEMA-COMMIT is a commit which should be used to initialize the DB for testing changes below it.
-- Check out that commit and initialize a fresh DB with postgres-new-audit.sql to test upgrades.

DO $$
    BEGIN
        if to_regproc('apply_audit_change') is null then
            raise exception 'You are running AUDIT UPGRADE script, but the procedure ''apply_audit_change'' is missing.
Are you sure you are running this upgrade script on the correct database?
Current database name is ''%'', schema name is ''%''.
Perhaps you have separate audit database?', current_database(), current_schema();
        end if;
    END
$$;

-- SCHEMA-COMMIT 4.4: commit 69e8c29b

-- changes for 4.4.1

-- support for partition generation in the past using negative argument
call apply_audit_change(1, $aac$
-- Use negative futureCount for creating partitions for the past months if needed.
CREATE OR REPLACE PROCEDURE audit_create_monthly_partitions(futureCount int)
    LANGUAGE plpgsql
AS $$
DECLARE
    dateFrom TIMESTAMPTZ = date_trunc('month', current_timestamp);
    dateTo TIMESTAMPTZ;
    tableSuffix TEXT;
BEGIN
    -- noinspection SqlUnused
    FOR i IN 1..abs(futureCount) loop
        dateTo := dateFrom + interval '1 month';
        tableSuffix := to_char(dateFrom, 'YYYYMM');

        BEGIN
            -- PERFORM = select without using the result
            PERFORM ('ma_audit_event_' || tableSuffix)::regclass;
            RAISE NOTICE 'Tables for partition % already exist, OK...', tableSuffix;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Creating partitions for range: % - %', dateFrom, dateTo;

            -- values FROM are inclusive (>=), TO are exclusive (<)
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_event FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_event_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_delta FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_delta_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_ref FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_ref_' || tableSuffix, dateFrom, dateTo);

            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_delta_' || tableSuffix,
                    'ma_audit_delta_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_ref_' || tableSuffix,
                    'ma_audit_ref_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
        END;

        IF futureCount < 0 THEN
            -- going to the past
            dateFrom := dateFrom - interval '1 month';
        ELSE
            dateFrom := dateTo;
        END IF;

    END loop;
END $$;
$aac$);

-- SCHEMA-COMMIT 4.4.1: commit de18c14f

-- changes for 4.5

-- MID-7484
call apply_audit_change(2, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MESSAGE_TEMPLATE' AFTER 'LOOKUP_TABLE';
$aa$);

-- SCHEMA-COMMIT 4.6: commit 71f2df50

-- changes for 4.7
-- Simulation related changes
call apply_audit_change(3, $aa$
   ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'SIMULATION_RESULT' AFTER 'SHADOW';
   ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MARK' AFTER 'LOOKUP_TABLE';
$aa$);

-- changes for 4.8
-- Shadow auditing
call apply_audit_change(4, $aa$
   ALTER TYPE AuditEventStageType ADD VALUE IF NOT EXISTS 'RESOURCE' AFTER 'EXECUTION';
   ALTER TYPE AuditEventTypeType ADD VALUE IF NOT EXISTS 'DISCOVER_OBJECT' AFTER 'RUN_TASK_IMMEDIATELY';
$aa$);

call apply_audit_change(5, $aa$
   CREATE TYPE EffectivePrivilegesModificationType AS ENUM ('ELEVATION', 'FULL_ELEVATION', 'REDUCTION', 'OTHER');
   ALTER TABLE ma_audit_event
     ADD COLUMN effectivePrincipalOid UUID,
     ADD COLUMN effectivePrincipalType ObjectType,
     ADD COLUMN effectivePrincipalName TEXT,
     ADD COLUMN effectivePrivilegesModification EffectivePrivilegesModificationType;
$aa$);


call apply_audit_change(6, $aa$
   -- We try to create ShadowKindType (necessary if audit is in separate database, if it is in same
   -- database as repository, type already exists.
   DO $$ BEGIN
       CREATE TYPE ShadowKindType AS ENUM ('ACCOUNT', 'ENTITLEMENT', 'GENERIC', 'UNKNOWN');
   EXCEPTION
       WHEN duplicate_object THEN null;
   END $$;

   ALTER TABLE ma_audit_delta
     ADD COLUMN shadowKind ShadowKindType,
     ADD COLUMN shadowIntent TEXT;
$aa$);

-- Role Mining

call apply_audit_change(7, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_CLUSTER' AFTER 'ROLE';
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_SESSION' AFTER 'ROLE_ANALYSIS_CLUSTER';
$aa$);

-- Informatoin Disclosure
call apply_audit_change(8, $aa$
ALTER TYPE AuditEventTypeType ADD VALUE IF NOT EXISTS 'INFORMATION_DISCLOSURE' AFTER 'DISCOVER_OBJECT';
$aa$);

-- WRITE CHANGES ABOVE ^^

-- IMPORTANT: update apply_audit_change number at the end of postgres-audit.sql
-- to match the number used in the last change here!
-- Also update SqaleUtils.CURRENT_SCHEMA_AUDIT_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java

```

## /Users/ddonahoe/code/midpoint/database/postgres-upgrade.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- This is the update script for the MAIN REPOSITORY, it will not work for a separate audit database.
-- It is safe to run this script repeatedly, so if you're not sure, just run it to be up to date.
-- DO NOT use explicit COMMIT commands inside the apply_change blocks - leave that to the procedure.
-- If necessary, split your changes into multiple apply_changes calls to enforce the commit
-- before another change - for example when adding values to the custom enum types.

-- Using psql is strongly recommended, don't use tools with messy autocommit behavior like pgAdmin!
-- Using flag to stop on first error is also recommended, for example:
-- psql -v ON_ERROR_STOP=1 -h localhost -U midpoint -W -d midpoint -f postgres-new-upgrade.sql

-- SCHEMA-COMMIT is a Git commit which should be used to initialize the DB for testing changes below it.
-- Check out that commit and initialize a fresh DB with postgres-new-audit.sql to test upgrades.

DO $$
    BEGIN
        if to_regproc('apply_change') is null then
            raise exception 'You are running MAIN UPGRADE script, but the procedure ''apply_change'' is missing.
Are you sure you are running this upgrade script on the correct database?
Current database name is ''%'', schema name is ''%''.', current_database(), current_schema();
        end if;
    END
$$;

-- SCHEMA-COMMIT 4.4: commit 20ad200b
-- see: https://github.com/Evolveum/midpoint/blob/20ad200bd10a114fd70d2d131c0d11b5cd920150/config/sql/native-new/postgres-new.sql

-- changes for 4.4.1

-- adding trigger to mark org closure for refresh when org is inserted/deleted
call apply_change(1, $aa$
-- The trigger that flags the view for refresh after m_org changes.
CREATE OR REPLACE FUNCTION mark_org_closure_for_refresh_org()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO m_global_metadata VALUES ('orgClosureRefreshNeeded', 'true')
    ON CONFLICT (name) DO UPDATE SET value = 'true';

    -- after trigger returns null
    RETURN NULL;
END $$;

-- Update is not necessary, it does not change relations between orgs.
-- If it does, it is handled by trigger on m_ref_object_parent_org.
CREATE TRIGGER m_org_mark_refresh_tr
    AFTER INSERT OR DELETE ON m_org
    FOR EACH ROW EXECUTE FUNCTION mark_org_closure_for_refresh_org();
CREATE TRIGGER m_org_mark_refresh_trunc_tr
    AFTER TRUNCATE ON m_org
    FOR EACH STATEMENT EXECUTE FUNCTION mark_org_closure_for_refresh_org();
$aa$);

-- SCHEMA-COMMIT 4.4.1: commit de18c14f

-- changes for 4.5

-- MID-7484
-- We add the new enum value in separate change, because it must be committed before it is used.
call apply_change(2, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MESSAGE_TEMPLATE' AFTER 'LOOKUP_TABLE';
$aa$);

call apply_change(3, $aa$
CREATE TABLE m_message_template (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MESSAGE_TEMPLATE') STORED
        CHECK (objectType = 'MESSAGE_TEMPLATE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_message_template_oid_insert_tr BEFORE INSERT ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_message_template_update_tr BEFORE UPDATE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_message_template_oid_delete_tr AFTER DELETE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_message_template_nameOrig_idx ON m_message_template (nameOrig);
CREATE UNIQUE INDEX m_message_template_nameNorm_key ON m_message_template (nameNorm);
CREATE INDEX m_message_template_policySituation_idx
    ON m_message_template USING gin(policysituations gin__int_ops);
CREATE INDEX m_message_template_createTimestamp_idx ON m_message_template (createTimestamp);
CREATE INDEX m_message_template_modifyTimestamp_idx ON m_message_template (modifyTimestamp);
$aa$);

-- MID-7487 Identity matching
-- We add the new enum value in separate change, because it must be committed before it is used.
call apply_change(4, $aa$
CREATE TYPE CorrelationSituationType AS ENUM ('UNCERTAIN', 'EXISTING_OWNER', 'NO_OWNER', 'ERROR');
$aa$);

call apply_change(5, $aa$
ALTER TABLE m_shadow
ADD COLUMN correlationStartTimestamp TIMESTAMPTZ,
ADD COLUMN correlationEndTimestamp TIMESTAMPTZ,
ADD COLUMN correlationCaseOpenTimestamp TIMESTAMPTZ,
ADD COLUMN correlationCaseCloseTimestamp TIMESTAMPTZ,
ADD COLUMN correlationSituation CorrelationSituationType;

CREATE INDEX m_shadow_correlationStartTimestamp_idx ON m_shadow (correlationStartTimestamp);
CREATE INDEX m_shadow_correlationEndTimestamp_idx ON m_shadow (correlationEndTimestamp);
CREATE INDEX m_shadow_correlationCaseOpenTimestamp_idx ON m_shadow (correlationCaseOpenTimestamp);
CREATE INDEX m_shadow_correlationCaseCloseTimestamp_idx ON m_shadow (correlationCaseCloseTimestamp);
$aa$);

-- SCHEMA-COMMIT 4.5: commit c5f19c9e

-- changes for 4.6

-- MID-7746
-- We add the new enum value in separate change, because it must be committed before it is used.
call apply_change(6, $aa$
CREATE TYPE AdministrativeAvailabilityStatusType AS ENUM ('MAINTENANCE', 'OPERATIONAL');
$aa$);

call apply_change(7, $aa$
ALTER TABLE m_resource
ADD COLUMN administrativeOperationalStateAdministrativeAvailabilityStatus AdministrativeAvailabilityStatusType;
$aa$);

-- smart correlation
call apply_change(8, $aa$
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch; -- fuzzy string match (levenshtein, etc.)

ALTER TYPE ContainerType ADD VALUE IF NOT EXISTS 'FOCUS_IDENTITY' AFTER 'CASE_WORK_ITEM';
$aa$);

call apply_change(9, $aa$
CREATE TABLE m_focus_identity (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('FOCUS_IDENTITY') STORED
        CHECK (containerType = 'FOCUS_IDENTITY'),
    fullObject BYTEA,
    sourceResourceRefTargetOid UUID,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_focus_identity_sourceResourceRefTargetOid_idx ON m_focus_identity (sourceResourceRefTargetOid);

ALTER TABLE m_focus ADD normalizedData JSONB;
CREATE INDEX m_focus_normalizedData_idx ON m_focus USING gin(normalizedData);
$aa$);

-- resource templates
call apply_change(10, $aa$
ALTER TABLE m_resource ADD template BOOLEAN;
$aa$);

-- MID-8053: "Active" connectors detection
call apply_change(11, $aa$
ALTER TABLE m_connector ADD available BOOLEAN;
$aa$);

-- SCHEMA-COMMIT 4.5: commit c5f19c9e

-- No changes for audit schema in 4.6
-- SCHEMA-COMMIT 4.6: commit 71f2df50

-- changes for 4.7

-- Simulations, enum type changes
call apply_change(12, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MARK' AFTER 'LOOKUP_TABLE';
ALTER TYPE ReferenceType ADD VALUE IF NOT EXISTS 'PROCESSED_OBJECT_EVENT_MARK' AFTER 'PERSONA';
ALTER TYPE ReferenceType ADD VALUE IF NOT EXISTS 'OBJECT_EFFECTIVE_MARK' AFTER 'OBJECT_CREATE_APPROVER';
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'SIMULATION_RESULT' AFTER 'SHADOW';
ALTER TYPE ContainerType ADD VALUE IF NOT EXISTS 'SIMULATION_RESULT_PROCESSED_OBJECT' AFTER 'OPERATION_EXECUTION';
$aa$);

-- Simulations, tables
call apply_change(13, $aa$
CREATE TABLE m_simulation_result (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED
        CHECK (objectType = 'SIMULATION_RESULT'),
    partitioned boolean,
    rootTaskRefTargetOid UUID,
    rootTaskRefTargetType ObjectType,
    rootTaskRefRelationId INTEGER REFERENCES m_uri(id),
    startTimestamp TIMESTAMPTZ,
    endTimestamp TIMESTAMPTZ
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_simulation_result_oid_insert_tr BEFORE INSERT ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_simulation_result_update_tr BEFORE UPDATE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_simulation_result_oid_delete_tr AFTER DELETE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE TYPE ObjectProcessingStateType AS ENUM ('UNMODIFIED', 'ADDED', 'MODIFIED', 'DELETED');

CREATE TABLE m_simulation_result_processed_object (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    -- Owner does not have to be the direct parent of the container.
    -- use like this on the concrete table:
    -- ownerOid UUID NOT NULL REFERENCES m_object_oid(oid),
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    containerType ContainerType GENERATED ALWAYS AS ('SIMULATION_RESULT_PROCESSED_OBJECT') STORED
        CHECK (containerType = 'SIMULATION_RESULT_PROCESSED_OBJECT'),
    oid UUID,
    objectType ObjectType,
    nameOrig TEXT,
    nameNorm TEXT,
    state ObjectProcessingStateType,
    metricIdentifiers TEXT[],
    fullObject BYTEA,
    objectBefore BYTEA,
    objectAfter BYTEA,
    transactionId TEXT,
    focusRecordId BIGINT,

    PRIMARY KEY (ownerOid, cid)
) PARTITION BY LIST(ownerOid);

CREATE TABLE m_simulation_result_processed_object_default PARTITION OF m_simulation_result_processed_object DEFAULT;

CREATE OR REPLACE FUNCTION m_simulation_result_create_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(new.oid::text,'-','_');
      IF new.partitioned AND NOT EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been created %',partition;
        EXECUTE 'CREATE TABLE ' || partition || ' partition of ' || 'm_simulation_result_processed_object' || ' for values in (''' || new.oid|| ''');';
      END IF;
      RETURN NULL;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_create_partition AFTER INSERT ON m_simulation_result
 FOR EACH ROW EXECUTE FUNCTION m_simulation_result_create_partition();

--- Trigger which deletes processed objects partition when whole simulation is deleted

CREATE OR REPLACE FUNCTION m_simulation_result_delete_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(OLD.oid::text,'-','_');
      IF OLD.partitioned AND EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been deleted %',partition;
        EXECUTE 'DROP TABLE IF EXISTS ' || partition || ';';
      END IF;
      RETURN OLD;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_delete_partition BEFORE DELETE ON m_simulation_result
  FOR EACH ROW EXECUTE FUNCTION m_simulation_result_delete_partition();

CREATE TABLE m_processed_object_event_mark (
  ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
  ownerType ObjectType, -- GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED,
  processedObjectCid INTEGER NOT NULL,
  referenceType ReferenceType GENERATED ALWAYS AS ('PROCESSED_OBJECT_EVENT_MARK') STORED,
  targetOid UUID NOT NULL, -- soft-references m_object
  targetType ObjectType NOT NULL,
  relationId INTEGER NOT NULL REFERENCES m_uri(id)

) PARTITION BY LIST(ownerOid);

CREATE TABLE m_processed_object_event_mark_default PARTITION OF m_processed_object_event_mark DEFAULT;

CREATE TABLE m_mark (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MARK') STORED
        CHECK (objectType = 'MARK')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_mark_oid_insert_tr BEFORE INSERT ON m_mark
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_mark_update_tr BEFORE UPDATE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_mark_oid_delete_tr AFTER DELETE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

-- stores ObjectType/effectiveMarkRef
CREATE TABLE m_ref_object_effective_mark (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_EFFECTIVE_MARK') STORED
        CHECK (referenceType = 'OBJECT_EFFECTIVE_MARK'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_effective_mark_targetOidRelationId_idx
    ON m_ref_object_effective_mark (targetOid, relationId);
$aa$);

-- Minor index name fixes
call apply_change(14, $aa$
ALTER INDEX m_ref_object_create_approverTargetOidRelationId_idx
    RENAME TO m_ref_object_create_approver_targetOidRelationId_idx;
ALTER INDEX m_ref_object_modify_approverTargetOidRelationId_idx
    RENAME TO m_ref_object_modify_approver_targetOidRelationId_idx;
$aa$);

-- Making resource.abstract queryable
call apply_change(15, $aa$
ALTER TABLE m_resource ADD abstract BOOLEAN;
$aa$);

-- Task Affected Indexing (Changes to types)
call apply_change(16, $aa$
ALTER TYPE ContainerType ADD VALUE IF NOT EXISTS 'AFFECTED_OBJECTS' AFTER 'ACCESS_CERTIFICATION_WORK_ITEM';
$aa$);

-- Task Affected Indexing (tables), empty now, replaced with change 19

call apply_change(17, $$ SELECT 1 $$, true);


-- Resource/super/resourceRef Indexing (tables)
call apply_change(18, $aa$
ALTER TABLE m_resource
ADD COLUMN superRefTargetOid UUID,
ADD COLUMN superRefTargetType ObjectType,
ADD COLUMN superRefRelationId INTEGER REFERENCES m_uri(id);
$aa$);

-- Fixed upgrade for task indexing
-- Drop tables should only affect development machines
call apply_change(19, $aa$
DROP TABLE IF EXISTS m_task_affected_resource_objects;
DROP TABLE IF EXISTS m_task_affected_objects;

CREATE TABLE m_task_affected_objects (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('AFFECTED_OBJECTS') STORED
     CHECK (containerType = 'AFFECTED_OBJECTS'),
    activityId INTEGER REFERENCES m_uri(id),
    type ObjectType,
    archetypeRefTargetOid UUID,
    archetypeRefTargetType ObjectType,
    archetypeRefRelationId INTEGER REFERENCES m_uri(id),
    objectClassId INTEGER REFERENCES m_uri(id),
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    intent TEXT,
    kind ShadowKindType,
    PRIMARY KEY (ownerOid, cid)
) INHERITS(m_container);

$aa$);

call apply_change(20, $aa$
CREATE TYPE ExecutionModeType AS ENUM ('FULL', 'PREVIEW', 'SHADOW_MANAGEMENT_PREVIEW', 'DRY_RUN', 'NONE', 'BUCKET_ANALYSIS');
CREATE TYPE PredefinedConfigurationType AS ENUM ( 'PRODUCTION', 'DEVELOPMENT' );

ALTER TABLE m_task_affected_objects
  ADD COLUMN executionMode ExecutionModeType,
  ADD COLUMN predefinedConfigurationToUse PredefinedConfigurationType;
$aa$);

call apply_change(21, $aa$
ALTER TABLE m_user
  ADD COLUMN personalNumber TEXT;
$aa$);


-- Role Mining --

call apply_change(22, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_CLUSTER' AFTER 'ROLE';
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_SESSION' AFTER 'ROLE_ANALYSIS_CLUSTER';
$aa$);

call apply_change(23, $aa$
CREATE TABLE m_role_analysis_cluster (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_CLUSTER') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_CLUSTER'),
        parentRefTargetOid UUID,
        parentRefTargetType ObjectType,
        parentRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_cluster_oid_insert_tr BEFORE INSERT ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_cluster_update_tr BEFORE UPDATE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_cluster_oid_delete_tr AFTER DELETE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_role_analysis_cluster_parentRefTargetOid_idx ON m_role_analysis_cluster (parentRefTargetOid);
CREATE INDEX m_role_analysis_cluster_parentRefTargetType_idx ON m_role_analysis_cluster (parentRefTargetType);
CREATE INDEX m_role_analysis_cluster_parentRefRelationId_idx ON m_role_analysis_cluster (parentRefRelationId);


CREATE TABLE m_role_analysis_session (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_SESSION') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_SESSION')
        )
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_session_oid_insert_tr BEFORE INSERT ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_session_update_tr BEFORE UPDATE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_session_oid_delete_tr AFTER DELETE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();
$aa$);

-- Display Name for Connector Type

call apply_change(24, $aa$
    ALTER TABLE m_connector ADD  displayNameOrig TEXT;
    ALTER TABLE m_connector ADD displayNameNorm TEXT;
$aa$);


call apply_change(25, $aa$
CREATE OR REPLACE PROCEDURE m_refresh_org_closure(force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    flag_val text;
BEGIN
    -- We use advisory session lock only for the check + refresh, then release it immediately.
    -- This can still dead-lock two transactions in a single thread on the select/delete combo,
    -- (I mean, who would do that?!) but works fine for parallel transactions.
    PERFORM pg_advisory_lock(47);
    BEGIN
        SELECT value INTO flag_val FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        IF flag_val = 'true' OR force THEN
            REFRESH MATERIALIZED VIEW m_org_closure;
            DELETE FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        END IF;
        PERFORM pg_advisory_unlock(47);
    EXCEPTION WHEN OTHERS THEN
        -- Whatever happens we definitely want to release the lock.
        PERFORM pg_advisory_unlock(47);
        RAISE;
    END;
END;
$$;
$aa$);
---
-- WRITE CHANGES ABOVE ^^
-- IMPORTANT: update apply_change number at the end of postgres-new.sql
-- to match the number used in the last change here!
-- Also update SqaleUtils.CURRENT_SCHEMA_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java

```

## /Users/ddonahoe/code/midpoint/docker/pom.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>edu.vt</groupId>
    <artifactId>midpoint</artifactId>
    <version>4.8.5.2-SNAPSHOT</version>
  </parent>

  <artifactId>midpoint-docker</artifactId>

  <dependencies>
    <dependency>
      <groupId>edu.vt.midpoint</groupId>
      <artifactId>ldaptive-connector</artifactId>
      <exclusions>
        <exclusion>
          <groupId>com.evolveum.polygon</groupId>
          <artifactId>connector-common</artifactId>
        </exclusion>
        <exclusion>
          <groupId>net.tirasa.connid</groupId>
          <artifactId>connector-framework</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
    <dependency>
      <groupId>com.evolveum.polygon</groupId>
      <artifactId>connector-grouper</artifactId>
      <exclusions>
        <exclusion>
          <groupId>com.evolveum.polygon</groupId>
          <artifactId>connector-parent</artifactId>
        </exclusion>
        <exclusion>
          <groupId>net.tirasa.connid</groupId>
          <artifactId>connector-framework</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
    <dependency>
      <groupId>com.evolveum.polygon</groupId>
      <artifactId>connector-scripted-sql</artifactId>
      <exclusions>
        <exclusion>
          <groupId>com.evolveum.polygon</groupId>
          <artifactId>connector-parent</artifactId>
        </exclusion>
        <exclusion>
          <groupId>net.tirasa.connid</groupId>
          <artifactId>connector-framework</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>

  <build>
    <resources>
      <resource>
        <directory>src/main/resources</directory>
        <includes>
          <include>*</include>
        </includes>
        <filtering>true</filtering>
        <targetPath>${basedir}/target</targetPath>
      </resource>
    </resources>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-resources-plugin</artifactId>
        <executions>
          <execution>
            <id>copy-docker-resources</id>
            <phase>package</phase>
            <goals>
              <goal>copy-resources</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}</outputDirectory>
              <resources>
                <resource>
                  <directory>src/main/docker</directory>
                  <filtering>false</filtering>
                </resource>
              </resources>
            </configuration>
          </execution>
        </executions>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <executions>
          <execution>
            <id>copy-connector</id>
            <phase>package</phase>
            <goals>
              <goal>copy-dependencies</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}/files/mp-var/connid-connectors</outputDirectory>
              <includeGroupIds>edu.vt.midpoint</includeGroupIds>
            </configuration>
          </execution>
          <execution>
            <id>copy-connector-depends</id>
            <phase>package</phase>
            <goals>
              <goal>copy-dependencies</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}/files/mp-var/lib</outputDirectory>
              <excludeGroupIds>edu.vt.midpoint,org.slf4j</excludeGroupIds>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/env-dev.sh

```typescript
export DATABASE="pgdvlp.db.es.cloud.vt.edu"
export ED_LDAP="dev.id.directory.vt.edu"
export AD_LDAP="w2k-dev.vt.edu"
export AD_BIND_DN="CN=midpoint,OU=middleware,OU=vt,DC=w2k-dev,DC=vt,DC=edu"
export AD_BASE_DN="DC=w2k-dev,DC=vt,DC=edu"
export AD_BASE_DN_OUTBOUND="OU=vt,DC=w2k-dev,DC=vt,DC=edu"
export OIDC_CLIENT_ID="4da7d557-48c2-1000-a1bb-000ed75edf30"
export OIDC_ISSUER="https://dev.gateway.login.vt.edu"

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/env-local.sh

```typescript
export DATABASE="midpoint-db"
export OIDC_CLIENT_ID="4da7d557-48c2-1000-a1bb-000ed75edf30"
export OIDC_ISSUER="https://dev.gateway.login.vt.edu"
export JAVA_HEAP_PERCENT=80
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/env-pprd.sh

```typescript
export DATABASE="pgpprd.db.es.cloud.vt.edu"
export ED_LDAP="pprd.id.directory.vt.edu"
export AD_LDAP="pdc.w2k-test.vt.edu"
export AD_BIND_DN="CN=midpoint,OU=middleware,OU=vt,DC=w2k-test,DC=vt,DC=edu"
export AD_BASE_DN="DC=w2k-test,DC=vt,DC=edu"
export AD_BASE_DN_OUTBOUND="OU=vt,DC=w2k-test,DC=vt,DC=edu"
export OIDC_CLIENT_ID="2518c599-42fe-1000-a5fc-fffffbd7523d"
export OIDC_ISSUER="https://pprd.gateway.login.vt.edu"

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/env-prod.sh

```typescript
export DATABASE="pgprod.db.es.cloud.vt.edu"
export ED_LDAP="id.directory.vt.edu"
export AD_LDAP="pdc.w2k.vt.edu"
export AD_BIND_DN="CN=midpoint,OU=middleware,OU=vt,DC=w2k,DC=vt,DC=edu"
export AD_BASE_DN="DC=w2k,DC=vt,DC=edu"
export AD_BASE_DN_OUTBOUND="OU=vt,DC=w2k,DC=vt,DC=edu"
export OIDC_CLIENT_ID="f632e2fe-8b9f-1001-b1d2-fffff33fdd7a"
export OIDC_ISSUER="https://gateway.login.vt.edu"

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/jvm-stats.sh

```typescript
#!/bin/bash

JAVA_PROC_ID=$(pgrep -f java)

for P in $JAVA_PROC_ID
do

  # execute the ps command with the process id
  PS_CPU_MEM_OUT=$(ps -p ${P} -o "%cpu %mem")
  PS_CMD_OUT=$(ps -p ${P} -o "command")
  # cat meminfo from proc
  MEMINFO_OUT=$(cat /proc/meminfo |head -3)
  # cat cgroup memory
  if [ -f /sys/fs/cgroup/cgroup.controllers ]; then
    # cgroups v2
    CGROUP_VERSION="2"
    CGROUP_MEM_CURR=$(cat /sys/fs/cgroup/memory.current)
    CGROUP_MEM_MAX=$(cat /sys/fs/cgroup/memory.max)
  else
    # cgroups v1
    CGROUP_VERSION="1"
    CGROUP_MEM_CURR=$(cat /sys/fs/cgroup/memory/memory.usage_in_bytes)
    CGROUP_MEM_MAX=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
  fi
  # execute the jstat command with the process id
  JSTAT_OUT=$(jstat -gc ${P})

  # parse the two lines of output into an array for both ps and jstat
  OLD_IFS=${IFS}
  IFS=$'\n'
  PS_CPU_MEM_LINES=($PS_CPU_MEM_OUT)
  PS_CMD_LINES=($PS_CMD_OUT)
  MEMINFO_LINES=($MEMINFO_OUT)
  JSTAT_LINES=($JSTAT_OUT)
  IFS=${OLD_IFS}

  # read the ps data from the second line
  PS_CPU_MEM_VALS=(${PS_CPU_MEM_LINES[1]})
  CPU_PERCENT=${PS_CPU_MEM_VALS[0]}
  MEM_PERCENT=${PS_CPU_MEM_VALS[1]}
  COMMAND=${PS_CMD_LINES[1]}

  # read the meminfo data from all lines
  MEM_TOTAL=$(echo ${MEMINFO_LINES[0]} |cut -d':' -f2 |xargs |cut -d' ' -f1)
  MEM_FREE=$(echo ${MEMINFO_LINES[1]} |cut -d':' -f2 |xargs |cut -d' ' -f1)
  MEM_AVAIL=$(echo ${MEMINFO_LINES[2]} |cut -d':' -f2 |xargs |cut -d' ' -f1)
  # convert KB to MB
  MEM_TOTAL=$((${MEM_TOTAL} / 1024))
  MEM_FREE=$((${MEM_FREE} / 1024))
  MEM_AVAIL=$((${MEM_AVAIL} / 1024))

  # convert B to MB
  CGROUP_MEM_CURR=$((${CGROUP_MEM_CURR} / 1048576))
  if [ "$CGROUP_MEM_MAX" = "max" ]; then
    CGROUP_MEM_MAX=0
  else
    CGROUP_MEM_MAX=$((${CGROUP_MEM_MAX} / 1048576))
  fi

  # read the jstat keys from the first line
  JSTAT_KEYS=(${JSTAT_LINES[0]})
  # read the jstat values from the second line
  JSTAT_VALS=(${JSTAT_LINES[1]})
  # assert we have the same number of keys and values
  if [ ${#JSTAT_KEYS[@]} -ne ${#JSTAT_VALS[@]} ]; then
    echo "jstat key value mismatch"
    exit 1
  fi

  # for jstat output:
  # S0C   S1C   S0U   S1U   EC   EU   OC   OU   MC   MU   CCSC   CCSU   YGC   YGCT   FGC   FGCT   CGC   CGCT   GCT
  # M prefixed fields are metaspace, not used for heap calculations
  # when you add all the utilizations (OU + EU + S0U + S1U)  you get the total heap utilization
  # when you add all the capacity (OC + EC + S0C + S1C)  you get the total heap size
  HEAP_UTIL=0
  HEAP_SIZE=0
  MD_UTIL=0
  MD_SIZE=0
  for i in "${!JSTAT_KEYS[@]}"; do
    if [ "${JSTAT_KEYS[$i]}" = "OU" ] || [ "${JSTAT_KEYS[$i]}" = "EU" ] || [ "${JSTAT_KEYS[$i]}" = "S0U" ] || [ "${JSTAT_KEYS[$i]}" = "S1U" ]; then
      HEAP_UTIL=$((${HEAP_UTIL} + $(printf "%.0f" ${JSTAT_VALS[$i]})))
    elif [ "${JSTAT_KEYS[$i]}" = "OC" ] || [ "${JSTAT_KEYS[$i]}" = "EC" ] || [ "${JSTAT_KEYS[$i]}" = "S0C" ] || [ "${JSTAT_KEYS[$i]}" = "S1C" ]; then
      HEAP_SIZE=$((${HEAP_SIZE} + $(printf "%.0f" ${JSTAT_VALS[$i]})))
    elif [ "${JSTAT_KEYS[$i]}" = "MU" ]; then
      MD_UTIL=$((${MD_UTIL} + $(printf "%.0f" ${JSTAT_VALS[$i]})))
    elif [ "${JSTAT_KEYS[$i]}" = "MC" ]; then
      MD_SIZE=$((${MD_SIZE} + $(printf "%.0f" ${JSTAT_VALS[$i]})))
    fi
  done
  # convert KB to MB
  HEAP_UTIL=$((${HEAP_UTIL} / 1024))
  HEAP_SIZE=$((${HEAP_SIZE} / 1024))
  MD_UTIL=$((${MD_UTIL} / 1024))
  MD_SIZE=$((${MD_SIZE} / 1024))

  # build a log statement to emit
  LOG=`date +"%Y-%m-%dT%H:%M:%S%z"`
  LOG+=" \"$COMMAND\" PROCESS=$P CPU_PERCENT=$CPU_PERCENT MEM_PERCENT=$MEM_PERCENT MEM_TOTAL=$MEM_TOTAL MEM_FREE=$MEM_FREE MEM_AVAIL=$MEM_AVAIL CGROUP_VERSION=$CGROUP_VERSION CGROUP_MEM_CURR=$CGROUP_MEM_CURR CGROUP_MEM_MAX=$CGROUP_MEM_MAX HEAP_SIZE=$HEAP_SIZE HEAP_UTIL=$HEAP_UTIL MD_SIZE=$MD_SIZE MD_UTL=$MD_UTIL"
  for i in "${!JSTAT_KEYS[@]}"; do
    LOG+=" ${JSTAT_KEYS[$i]}=${JSTAT_VALS[$i]}"
  done
  echo "$LOG"
done


```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/prepare-upgrade.sh

```typescript
#!/bin/bash
# Prepares for a MidPoint upgrade by running some helpful Ninja commands:
#
# 1. Run ninja pre-upgrade-check
# 2. Run ninja verify
#
# This script MUST be executed from a container running the current MidPoint version.

source "$MP_DIR/bin/env-$ENV.sh"

echo "Performing the pre-upgrade check..."
PRE_UPGRADE_CHECK_OUT="/tmp/ninja-pre-upgrade-check.out"
${MP_DIR}/bin/ninja.sh pre-upgrade-check &> "$PRE_UPGRADE_CHECK_OUT"
if [ $? -eq 0 ]; then
  echo "Pre-upgrade check passed"
else
  echo "Pre-upgrade check produced warnings and/or errors that must be addressed."
  echo "See output for details:"
  cat "$PRE_UPGRADE_CHECK_OUT"
  exit 1
fi

echo "Performing the verify step..."
VERIFY_OUT="/tmp/ninja-verify.csv"
${MP_DIR}/bin/ninja.sh verify -o $VERIFY_OUT --report-style csv
if [ $(grep -c "NECESSARY" "$VERIFY_OUT") -gt 0 ]; then
  echo "Verify produced warnings that must be addressed."
  echo "Attempting to resolve automatically using \"upgrade-objects\" command."
  ${MP_DIR}/bin/ninja.sh upgrade-objects --verification-file "$VERIFY_OUT"
  if [ $? -ne 0 ]; then
    echo "Automatic upgrade of objects failed."
    echo "Manual resolution is required. Please review output for details:"
    cat "$VERIFY_OUT"
    exit 1
  fi
else
  echo "Verify step passed"
fi

echo "------------------------------------"
echo " The system is ready to be upgraded."
echo "------------------------------------"

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/setenv.sh

```typescript
#!/usr/bin/env bash

# NOTE: The execution context of this script appears to be "set -u"
# which causes undefined variable references to terminate script execution.
# For example, use of an undefined variable X will terminate execution with
# the following error:
#
# "X: unbound variable"
#
# A practical consequence of this is that "-z $VARIABLE" checks in if blocks
# as a way to define defaults will not work. Instead, use bash ${VARIABLE-default}
# notation.

# set umask so that log files will be world readable
export UMASK="0022"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/env-$ENV.sh"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
else
  echo "Unknown environment: $ENV"
  exit 1
fi

# Set Java heap size to a percentage of the total container memory
if [ -z "$CONTAINER_MEM" ]; then
  echo "CONTAINER_MEM is not set, cannot start JVM"
  exit 1;
fi
JAVA_MEM=$((${CONTAINER_MEM} * ${JAVA_HEAP_PERCENT-80} / 100))
echo "Starting JVM with $JAVA_MEM calculated from $CONTAINER_MEM and $JAVA_HEAP_PERCENT"
export MP_MEM_MAX="${JAVA_MEM}m"
export MP_MEM_INIT="${JAVA_MEM}m"
export JAVA_OPTS="-XX:+AlwaysPreTouch -XshowSettings:all -Dmidpoint.tier=${ENV} ${JAVA_OPTS}"

# Define system properties used to configure logging paths
export MP_SET_midpoint_logs="$LOGDIR"
export MP_SET_midpoint_host="$HOSTNAME"

# Determine whether vault integration is necessary for current runtime environment
if [ -f ${MP_DIR}/tmp/db/midpoint_app/password ]; then
  USE_VAULT="n"
else
  USE_VAULT="y"
fi
echo "Using vault for secrets: $USE_VAULT"

TODAY=$(date +"%Y-%m-%d")
if [ "$USE_VAULT" = "y" ]; then
  export SCRATCH_DIR="${MP_DIR}/tmp"
  # Perform a vault login
  echo "Logging into vault"
  ${MP_DIR}/bin/vault.sh login 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log
  # Retrieve database credentials
  echo "Reading midpoint_app database credentials"
  ${MP_DIR}/bin/vault.sh read_creds ${DATABASE} midpoint_app 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log
  echo "Reading gr_to_mp_app database credentials"
  ${MP_DIR}/bin/vault.sh read_creds ${DATABASE} gr_to_mp_app 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log
  echo "Reading mp_to_gr_app database credentials"
  ${MP_DIR}/bin/vault.sh read_creds ${DATABASE} mp_to_gr_app 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log
fi

# Set database env
SSLOPTS=""
if [ "$ENV" != "local" ]; then
  SSLOPTS="sslmode=require&"
fi
export MP_SET_midpoint_repository_missingSchemaAction="stop"
export MP_SET_midpoint_repository_database="postgresql"
export MP_SET_midpoint_repository_jdbcUrl="jdbc:postgresql://${DATABASE}:5432/midpoint?${SSLOPTS}currentSchema=midpoint"
export MP_SET_midpoint_repository_jdbcUsername=$(cat ${MP_DIR}/tmp/db/midpoint_app/username)
export MP_SET_midpoint_repository_jdbcPassword_FILE="${MP_DIR}/tmp/db/midpoint_app/password"
echo "Midpoint repo URL $MP_SET_midpoint_repository_jdbcUrl with username $MP_SET_midpoint_repository_jdbcUsername"

# Set ldap env
echo "Using ED ldap ${ED_LDAP}"
sed -i "s/LDAP_URL/$ED_LDAP/" ${MP_DIR}/var/post-initial-objects/resources/100-inbound-users-ed-id-ldap.xml
echo "Using AD ldap ${AD_LDAP}"
sed -i "s/LDAP_HOST/$AD_LDAP/" ${MP_DIR}/var/post-initial-objects/resources/100-inbound-users-ad-ldap.xml
sed -i "s/LDAP_HOST/$AD_LDAP/" ${MP_DIR}/var/post-initial-objects/resources/100-outbound-ad-security-groups.xml
echo "Using AD bind dn ${AD_BIND_DN}"
sed -i "s/LDAP_BIND_DN/$AD_BIND_DN/" ${MP_DIR}/var/post-initial-objects/resources/100-inbound-users-ad-ldap.xml
sed -i "s/LDAP_BIND_DN/$AD_BIND_DN/" ${MP_DIR}/var/post-initial-objects/resources/100-outbound-ad-security-groups.xml
echo "Using AD base dn ${AD_BASE_DN}"
sed -i "s/LDAP_BASE_DN/$AD_BASE_DN/" ${MP_DIR}/var/post-initial-objects/resources/100-inbound-users-ad-ldap.xml
echo "Using AD base dn ${AD_BASE_DN}"
sed -i "s/LDAP_BASE_DN/$AD_BASE_DN/" ${MP_DIR}/var/post-initial-objects/resources/100-outbound-ad-security-groups.xml
echo "Using AD outbound base dn ${AD_BASE_DN_OUTBOUND}"
sed -i "s/AD_BASE_DN_OUTBOUND/$AD_BASE_DN_OUTBOUND/" ${MP_DIR}/var/post-initial-objects/resources/100-outbound-ad-security-groups.xml

if [ "$USE_VAULT" = "y" ]; then
  # Retrieve secrets
  ${MP_DIR}/bin/vault.sh get_keyvalues ${ENV} 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log
fi

# Apply secrets and other security configuration
KEYSTORE_PASSWD=$(cat ${MP_DIR}/tmp/midpoint.keystore.password)
sed -i "s/KEYSTORE_PASSWORD/$KEYSTORE_PASSWD/" $MIDPOINT_HOME/config.xml
unset KEYSTORE_PASSWD
ADMIN_PASSWD=$(cat ${MP_DIR}/tmp/administrator.password)
sed -i "s/ADMIN_PASSWORD/$ADMIN_PASSWD/" $MIDPOINT_HOME/post-initial-objects/user/050-user-administrator.xml
unset ADMIN_PASSWD
OIDC_CLIENT_SECRET=$(cat ${MP_DIR}/tmp/oidc.client.secret)
sed -i "s/OIDC_CLIENT_SECRET/$OIDC_CLIENT_SECRET/" $MIDPOINT_HOME/post-initial-objects/security-policy/010-security-policy.xml
sed -i "s/OIDC_CLIENT_ID/$OIDC_CLIENT_ID/" $MIDPOINT_HOME/post-initial-objects/security-policy/010-security-policy.xml
sed -i "s|OIDC_ISSUER|$OIDC_ISSUER|" $MIDPOINT_HOME/post-initial-objects/security-policy/010-security-policy.xml
unset OIDC_CLIENT_SECRET
ED_KEYSTORE_PASSWD=$(cat ${MP_DIR}/tmp/ed-service.keystore.password)
sed -i "s/KEYSTORE_PASSWORD/$ED_KEYSTORE_PASSWD/" ${MP_DIR}/var/post-initial-objects/resources/100-inbound-users-ed-id-ldap.xml
unset ED_KEYSTORE_PASSWD
AD_PASSWD=$(cat ${MP_DIR}/tmp/ad-service.password)
sed -i "s/LDAP_BIND_PASSWORD/$AD_PASSWD/" ${MP_DIR}/var/post-initial-objects/resources/100-inbound-users-ad-ldap.xml
sed -i "s/LDAP_BIND_PASSWORD/$AD_PASSWD/" ${MP_DIR}/var/post-initial-objects/resources/100-outbound-ad-security-groups.xml
unset AD_PASSWD

# Configure grouper-to-midpoint connection
sed -i "s/GROUPER_DB_HOST/$DATABASE/" $MIDPOINT_HOME/post-initial-objects/resources/100-inbound-grouper-groups.xml
GROUPER_DB_USER=$(cat ${MP_DIR}/tmp/db/gr_to_mp_app/username)
sed -i "s/GROUPER_DB_USER/$GROUPER_DB_USER/" $MIDPOINT_HOME/post-initial-objects/resources/100-inbound-grouper-groups.xml
unset GROUPER_DB_USER
GROUPER_DB_PASSWORD=$(cat ${MP_DIR}/tmp/db/gr_to_mp_app/password)
sed -i "s/GROUPER_DB_PASSWORD/$GROUPER_DB_PASSWORD/" $MIDPOINT_HOME/post-initial-objects/resources/100-inbound-grouper-groups.xml
unset GROUPER_DB_PASSWORD

# Configure midpoint-to-grouper connection
sed -i "s/GROUPER_DB_HOST/$DATABASE/" $MIDPOINT_HOME/post-initial-objects/resources/100-outbound-grouper-requests-scripted-sql.xml
INTERMEDIATE_DB_USER=$(cat ${MP_DIR}/tmp/db/mp_to_gr_app/username)
sed -i "s/INTERMEDIATE_DB_USER/$INTERMEDIATE_DB_USER/" $MIDPOINT_HOME/post-initial-objects/resources/100-outbound-grouper-requests-scripted-sql.xml
unset INTERMEDIATE_DB_USER
INTERMEDIATE_DB_PASSWORD=$(cat ${MP_DIR}/tmp/db/mp_to_gr_app/password)
sed -i "s/INTERMEDIATE_DB_PASSWORD/$INTERMEDIATE_DB_PASSWORD/" $MIDPOINT_HOME/post-initial-objects/resources/100-outbound-grouper-requests-scripted-sql.xml
unset INTERMEDIATE_DB_PASSWORD

if [ "$USE_VAULT" = "y" ]; then
  # Renew vault token
  echo "Starting vault renewal background process for database user midpoint_app"
  ${MP_DIR}/bin/vault.sh renew midpoint_app 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log &
  echo "Starting vault renewal background process for database user gr_to_mp_app"
  ${MP_DIR}/bin/vault.sh renew gr_to_mp_app 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log &
  echo "Starting vault renewal background process for database user mp_to_gr_app"
  ${MP_DIR}/bin/vault.sh renew mp_to_gr_app 2>&1 >>${LOGDIR}/vault-${HOSTNAME}-${TODAY}.log &
fi

# Check if our software version matches the database version
ninja_count=$(pgrep -cf ninja || true)
echo "ninja count: $ninja_count"
if [ $ninja_count -eq 0 ]; then
  echo "Checking database version..."
  PRE_UPGRADE_CHECK_OUT="/tmp/ninja-pre-uprade-check.out"
  ${MP_DIR}/bin/ninja.sh pre-upgrade-check --skip-nodes-version-check &> "$PRE_UPGRADE_CHECK_OUT"
  if [ $? -gt 0 ]; then
    echo "Database versions differ, a manual upgrade is necessary"
    cat "$PRE_UPGRADE_CHECK_OUT"
    exit 1
  else
    echo "Database version matches"
  fi
else
  echo "ninja is running, don't check database"
fi

# Collect JVM statistics
echo "Collecting JVM statistics every 60 seconds"
while true; do sleep 60; TODAY=$(date +"%Y-%m-%d"); ${MP_DIR}/bin/jvm-stats.sh >>${LOGDIR}/splunk-jvmstats-${HOSTNAME}-${TODAY}.log; done &

echo "Finished setenv.sh as $(whoami) with $(env)"

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/upgrade-database.sh

```typescript
#!/bin/bash
# Performs a MidPoint database upgrade by performing the following steps:
#
# 3. Terminate running MidPoint ECS tasks
# 4. Ensure number of application-based database connections is 0
# 5. Execute MidPoint database upgrade scripts
#
# This script MUST be executed from a container running the target MidPoint version.
#
# Dependencies:
# - awscli
# - postgresql-client

source "$MP_DIR/bin/env-$ENV.sh"

echo "Stopping MidPoint ECS tasks as a prerequisite for database upgrade"
export AWS_DEFAULT_REGION="us-east-1"
CLUSTER="mw-midpoint-ecs-$ENV"
SERVICE="mw-midpoint-$ENV"
echo "Setting desired-count=0 on $CLUSTER/$SERVICE"
aws ecs update-service --cluster $CLUSTER --service $SERVICE --desired-count 0
echo "Waiting for $CLUSTER/$SERVICE to stabilize..."
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE

# Create a pgpass file to facilitate psql connections
export SCRATCH_DIR="${MP_DIR}/tmp"
export PGHOST=$DATABASE
export PGDATABASE=midpoint
export PGUSER=$(cat $SCRATCH_DIR/db/midpoint_app/username)
PGPASS=$(cat $SCRATCH_DIR/db/midpoint_app/password)
echo "${PGHOST}:5432:${PGDATABASE}:${PGUSER}:${PGPASS}" > ~/.pgpass
chmod 600 ~/.pgpass

echo "Checking number of midpoint database connections..."
COUNT_QUERY="select count(*) from pg_stat_activity where datname = '$DATABASE' and usename <> 'dbaa_vault'"
CONN_COUNT=$(psql -c "$COUNT_QUERY" | tail -n+3 | tr -d ' ' | head -n1)
if [ $CONN_COUNT -ne 0 ]; then
  echo "Cannot update because connection count is non-zero ($CONN_COUNT)"
  exit 1
fi

echo "Performing database upgrade..."
SQL_DIR=$MP_DIR/var/sql-scripts
psql -v ON_ERROR_STOP=1 -f $SQL_DIR/postgres-upgrade.sql -f $SQL_DIR/postgres-audit-upgrade.sql
if [ $? -ne 0 ]; then
  echo "Database upgrade failed. See output above for details."
  exit 1
fi
echo "------------------------------------"
echo " Database upgrade process completed."
echo "------------------------------------"

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-bin/vault.sh

```typescript
#!/bin/bash -e

set -o pipefail

COMMAND=$1
export VAULT_CMD="${MP_DIR}/bin/vault"
if [ -z "$SCRATCH_DIR" ]; then
  echo "SCRATCH_DIR variable s not defined as required"
  exit 1
fi
export VAULT_ADDR=https://vault.es.cloud.vt.edu:8200

print_log() {
  local today=$(date +"%Y-%m-%d")
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >>${LOGDIR}/vault-${HOSTNAME}-${today}.log
}

vault_login() {
  local vault_role="mw-midpoint-${ENV}"
  print_log "Begin vault_login for $vault_role"
  local vault_login_output=$(${VAULT_CMD} login -method=aws -format json role=$vault_role header_value=vault.es.cloud.vt.edu)
  local auth_token=$(echo "$vault_login_output" | jq -r '.auth.client_token')
  local lease_duration=$(echo "$vault_login_output" | jq -r '.auth.lease_duration')
  # sanitize the JSON for logging
  vault_login_output=$(echo $vault_login_output | jq -r 'del(.auth.client_token)' | jq -r 'del(.auth.accessor)')
  echo "$auth_token" >"${SCRATCH_DIR}/auth.token"
  echo "$lease_duration" > "${SCRATCH_DIR}/lease.duration"
  print_log "Finished vault_login: $vault_login_output"
}

read_creds() {
  local db="$1"
  local user="$2"
  print_log "Begin read_creds for $db user $user"
  local out_dir="$SCRATCH_DIR/db/$user"
  if [ ! -d "$out_dir" ]; then
    mkdir -p "$out_dir"
  fi
  # read database credentials
  local vault_read_output=$($VAULT_CMD read -format json "$db/creds/$user")
  # extract the lease id from the JSON
  local lease_id=$(echo $vault_read_output | jq -r '.lease_id')
  print_log "Obtained lease $lease_id for database user $user"
  # store the lease id for renewal
  echo $lease_id > "$out_dir/lease.id"
  local lease_duration=$(cat "$SCRATCH_DIR/lease.duration")
  local db_lease_ttl=$(echo $vault_read_output | jq -r '.lease_duration')
  print_log "Auth lease duration is $lease_duration and db lease ttl is $db_lease_ttl"
  # Store the lesser of DB lease TTL and vault token lease duration
  if [ "$db_lease_ttl" -lt "$lease_duration" ]; then
    echo "$db_lease_ttl" > "$out_dir/lease.duration"
  else
    echo "$lease_duration" > "$out_dir/lease.duration"
  fi
  # Store any elements in the data section
  for f in `echo $vault_read_output | jq -r '.data | keys[]'`; do
    echo $vault_read_output | jq -r --arg key "$f" '.data."\($key)"' > "$out_dir/$f"
  done
  # sanitize the JSON for logging
  vault_read_output=$(echo $vault_read_output | jq -r 'del(.data)')
  print_log "Finished read_creds: $vault_read_output"
}

get_keyvalues() {
  local tier="$1"
  print_log "Begin get_keyvalues for $tier"

  # read database credentials
  local vault_kv_output=$(${VAULT_CMD} kv get -format json "dit.middleware/midpoint/${tier}")

  # store any elements in the data section
  for f in `echo $vault_kv_output | jq -r '.data.data | keys[]'`; do
    echo $vault_kv_output | jq -r --arg key "$f" '.data.data."\($key)"' >"$SCRATCH_DIR/$f"
  done

  # sanitize the JSON for logging
  vault_kv_output=$(echo $vault_kv_output | jq -r 'del(.data.data)')
  print_log "Finished get_keyvalues: $vault_kv_output"
}

renew_login_token() {
  print_log "Begin renew_login_token"
  local exit_status=0
  if test -f "$SCRATCH_DIR/auth.token"; then
    local vault_token_renew_output=$(${VAULT_CMD} token renew -format=json)
    exit_status=$?  # Store the exit status of the last command
    if [ $exit_status -eq 0 ]; then
      # sanitize the JSON for logging
      vault_token_renew_output=$(echo $vault_token_renew_output | jq -r 'del(.auth.client_token)' | jq -r 'del(.auth.accessor)')
      print_log "Token renewed successfully: $vault_token_renew_output"
    else
      print_log "Token renewal failed."
    fi
  else
    print_log "No auth token found in $SCRATCH_DIR/auth.token. Exiting"
  fi
  return $exit_status
}

renew_lease() {
  local user="$1"
  print_log "Begin renew_lease for database user $user"
  local exit_status=0
  local lease_file="$SCRATCH_DIR/db/$user/lease.id"
  if test -f "$lease_file"; then
    local lease_id=$(cat "$lease_file")
    local lease_duration=$(cat "$SCRATCH_DIR/lease.duration")
    print_log "Found lease $lease_id with duration of $lease_duration for database user $user"
    local vault_lease_renew_output
    vault_lease_renew_output=$($VAULT_CMD lease renew -format json "$lease_id")
    exit_status=$?
    local db_lease_ttl=$(echo $vault_lease_renew_output | jq -r '.lease_duration')
    print_log "Auth lease duration for database user $user is $lease_duration and db lease ttl is $lease_ttl"
    # Store the lesser of DB lease TTL and vault token lease duration
    if [ "$db_lease_ttl" -lt "$lease_duration" ]; then
      echo "$db_lease_ttl" > "$SCRATCH_DIR/db/$user/lease.duration"
    else
      echo "$lease_duration" > "$SCRATCH_DIR/db/$user/lease.duration"
    fi
    if [ $exit_status -eq 0 ]; then
      print_log "DB lease for database user $user renewed successfully: $vault_lease_renew_output"
    else
      print_log "DB lease renewal failed for database user $user."
    fi
  else
    print_log "Database lease file $lease_file not found for database user $user. Exiting"
  fi
  return $exit_status
}

renew() {
  set -e
  local user="$1"
  print_log "Starting lease renewal process for database user $user"
  local total_retry_time=0
  local sleep_time=0
  while true; do
    if [ $total_retry_time -gt 0 ]; then
      # only wait 60 seconds on a renewal failure
      print_log "Sleeping for 60 seconds to renew database user $user"
      sleep 60
    else
      # sleep for 90% of lease duration
      local ttl=$(cat "$SCRATCH_DIR/db/$user/lease.duration")
      print_log "Lease duration is $ttl for database user $user"
      sleep_time=$(($ttl * 90 / 100))
      print_log "Sleeping for $sleep_time seconds for database user $user"
      sleep $sleep_time
    fi
    renew_login_token
    login_renewal_status=$?
    lease_renewal_status=1
    if [ $login_renewal_status -eq 0 ]; then
      # if login token renewal does not work then we don't attempt to renew leases
      renew_lease $user
      lease_renewal_status=$?
    fi
    if [ $login_renewal_status -ne 0 ] || [ $lease_renewal_status -ne 0 ]; then
      print_log "Renewal failed for database user $user. Retrying..."
      total_retry_time=$((total_retry_time + 60))
    else
      print_log "All renewals completed successfully for database user $user."
      total_retry_time=0
    fi
    if [ $total_retry_time -ge $sleep_time ]; then
      print_log "Max renewals tried for database user $user, quitting with total retry time of $total_retry_time"
      break
    fi
  done
}

if [ $COMMAND == "login" ]; then
  vault_login
elif [ $COMMAND == "read_creds" ]; then
  read_creds $2 $3
elif [ $COMMAND == "get_keyvalues" ]; then
  get_keyvalues $2
elif [ $COMMAND == "renew" ]; then
  renew $2
else
  print_log "Unknown command: $COMMAND"
  exit 1
fi

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/application.yml

```typescript
server:
  port: 8443
  ssl:
    enabled: true
    protocol: TLSv1.2
    key-store: /opt/midpoint/var/midpoint.localhost.p12
    key-store-password: changeit
    key-store-type: PKCS12
    trust-store: /opt/midpoint/var/midpoint.truststore.p12
    trust-store-password: changeit
    trust-store-type: PKCS12
  tomcat:
    accept-count: 100
    remote-ip-header: X-FORWARDED-FOR
    redirect-context-root: false
    accesslog:
      buffered: true
      directory: /apps/logs/access
      enabled: true
      file-date-format: -yyyy-MM-dd
      pattern: "%{yyyy-MM-dd'T'HH:mm:ss.SSSXX}t %u %{HOST}i %{x-amzn-tls-version}i %{x-amzn-tls-cipher-suite}i \"%{Referer}i\" \"%{User-Agent}i\" %a \"%r\" %s %b"
      prefix: tomcat-access-${HOSTNAME}
      rename-on-rotate: false
      request-attributes-enabled: true
      rotate: true
      suffix: .log
  forward-headers-strategy: NATIVE
  session:
    timeout: 120m
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/config.xml

```typescript
<?xml version="1.0"?>
<!--
  ~ Copyright (C) 2010-2021 Evolveum and contributors
  ~
  ~ This work is dual-licensed under the Apache License 2.0
  ~ and European Union Public License. See LICENSE file for details.
  -->

<!--
Example config.xml for Native PG repository.
To use it:
1. Copy it to $MIDPOINT_HOME, e.g. under midpoint.../var directory in the extracted archive.
2. Rename the copied file in $MIDPOINT_HOME to config.xml.
3. Check DB connection parameters and change them as needed.
4. Start midPoint (bin/start.sh) and observe the success in $MIDPOINT_HOME/log/midpoint.log.

For more info see:

* midPoint home:
https://docs.evolveum.com/midpoint/reference/deployment/midpoint-home-directory/

* Overriding config.xml parameters from command line:
https://docs.evolveum.com/midpoint/reference/deployment/midpoint-home-directory/overriding-config-xml-parameters/

* Repository configuration:
https://docs.evolveum.com/midpoint/reference/repository/configuration/

* Canonical config.xml auto-created if not present in $MIDPOINT_HOME (master branch):
https://github.com/Evolveum/midpoint/blob/master/repo/system-init/src/main/resources/config.xml
-->
<configuration>
    <midpoint>
        <webApplication>
            <importFolder>${midpoint.home}/import</importFolder>
        </webApplication>
        <repository>
            <type>native</type>
            <jdbcUrl>${midpoint.repository.jdbcUrl}</jdbcUrl>
            <jdbcUsername>${midpoint.repository.jdbcUsername}</jdbcUsername>
            <jdbcPassword>${midpoint.repository.jdbcPasswordFile}</jdbcPassword>
        </repository>
        <audit>
            <auditService>
                <auditServiceFactoryClass>com.evolveum.midpoint.audit.impl.LoggerAuditServiceFactory</auditServiceFactoryClass>
            </auditService>
            <auditService>
                <auditServiceFactoryClass>com.evolveum.midpoint.repo.sqale.audit.SqaleAuditServiceFactory</auditServiceFactoryClass>
            </auditService>
        </audit>
        <icf>
            <scanClasspath>true</scanClasspath>
            <scanDirectory>${midpoint.home}/connid-connectors</scanDirectory>
        </icf>
        <!--
        Create this keystore with the following command:
        keytool -genseckey -alias key1 -keystore keystore.jceks -storetype jceks -storepass <passwd> -keyalg AES -keysize 256 -keypass midpoint
        Store the keystore password in the appropriate vault tier
        -->
        <keystore>
            <keyStorePath>${midpoint.home}/keystore.${midpoint.tier}.jceks</keyStorePath>
            <keyStorePassword>KEYSTORE_PASSWORD</keyStorePassword>
            <encryptionKeyAlias>key1</encryptionKeyAlias>
        </keystore>
    </midpoint>
</configuration>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/logback.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <logger name="com.evolveum.midpoint" level="INFO"/>
  <!-- framework logging for connector testing -->
  <!--
  <logger name="org.identityconnectors.framework" level="DEBUG"/>
  -->
  <!--
  <logger name="com.evolveum.midpoint.init.StartupConfiguration" level="TRACE"/>
  -->
  <!-- This class will log each HTTP request at INFO -->
  <logger name="org.apache.wicket.protocol.http.RequestLogger" level="ERROR"/>

  <!-- This class is too chatty at INFO level -->
  <logger name="org.springframework.security.web.DefaultSecurityFilterChain" level="ERROR"/>

  <!-- LDAP connector-->
  <logger name="edu.vt.midpoint.connector.ldaptive" level="INFO"/>

  <!-- ldaptive logging-->
  <logger name="org.ldaptive" level="INFO"/>
  <!-- Following categories are chatty at INFO -->
  <logger name="org.ldaptive.transport.netty" level="WARN"/>
  <logger name="org.ldaptive.SingleConnectionFactory" level="WARN" />

  <appender name="SPLUNK" class="ch.qos.logback.core.FileAppender">
    <file>${midpoint.logs}/splunk-${midpoint.host}.log</file>
    <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
      <charset>UTF-8</charset>
      <pattern>%date{"yyyy-MM-dd'T'HH:mm:ss.SSSXX"} %t %X{req.xForwardedFor:-null} %level [%logger:%line] %msg%n%ex{3}</pattern>
    </encoder>
  </appender>

  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <charset>UTF-8</charset>
      <pattern>%date{"yyyy-MM-dd'T'HH:mm:ss.SSSXX"} %t %X{req.xForwardedFor:-null} %level [%logger:%line] %msg%n%ex{3}</pattern>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="CONSOLE" />
    <appender-ref ref="SPLUNK" />
  </root>
</configuration>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/archetypes/300-archetype-ad-security-group.xml

```typescript
<archetype xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3" xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3" xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3" xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3" xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3" xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" oid="96ed6c50-1057-4b31-bd31-d1edb160af86" version="8" >
    <name>AD Security grouper group</name>
    <description>Grouper groups that will be provisioned to AD as security groups.</description>
    <activation/>
    <inducement>
        <construction>
            <strength>strong</strength>
            <resourceRef oid="728904ad-59ed-4473-bfac-dc6aebd26d6e" relation="org:default" type="c:ResourceType"/>
            <kind>entitlement</kind>
            <intent>group</intent>
        </construction>
        <orderConstraint>
            <orderMin>1</orderMin>
            <orderMax>unbounded</orderMax>
        </orderConstraint>
        <focusType>RoleType</focusType>
    </inducement>
    <inducement id="18">
        <construction>
            <resourceRef oid="728904ad-59ed-4473-bfac-dc6aebd26d6e" relation="org:default" type="c:ResourceType"/>
            <kind>account</kind>
            <intent>default</intent>
            <association id="19">
                <ref>ri:group</ref>
                <outbound>
                    <strength>strong</strength>
                    <expression>
                        <associationFromLink>
                            <projectionDiscriminator xsi:type="c:ShadowDiscriminatorType">
                                <kind>entitlement</kind>
                                <intent>group</intent>
                            </projectionDiscriminator>
                        </associationFromLink>
                    </expression>
                </outbound>
            </association>
        </construction>
        <orderConstraint>
            <orderMin>2</orderMin>
            <orderMax>unbounded</orderMax>
        </orderConstraint>
        <focusType>UserType</focusType>
    </inducement>
    <archetypePolicy>
        <display>
            <label>AD Security Group</label>
            <pluralLabel>AD Security Groups</pluralLabel>
            <icon>
                <cssClass>fa fa-shield</cssClass>
                <color>darkblue</color>
            </icon>
        </display>
    </archetypePolicy>
</archetype>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/archetypes/300-archetype-approver-of-requestable-role.xml

```typescript
<archetype xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
           xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
           xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
           xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
           xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
           xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
           xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:ext="http://midpoint-grouper-integration.itap.internet2.edu"
           oid="845ea5b1-2ab1-42db-9c47-9ed770a26973">
    <name>Grouper-Group-Requestable-Role-Approver</name>
    <archetypePolicy>
        <display>
            <label>Grouper Requestable Role Approver</label>
            <pluralLabel>Grouper Requestable Role Approvers</pluralLabel>
            <icon>
                <cssClass>fa fa-gavel</cssClass>
                <color>yellow</color>
            </icon>
        </display>
    </archetypePolicy>
    <inducement>
        <targetRef oid="5a94f694-5419-42fb-9305-30e90a14b7f9" type="RoleType"/>
        <focusType>UserType</focusType>
        <orderConstraint>
            <orderMin>1</orderMin>
            <orderMax>unbounded</orderMax>
        </orderConstraint>
    </inducement>
</archetype>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/archetypes/300-archetype-grouper-group.xml

```typescript
<archetype xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
           xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
           xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
           xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
           xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
           xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
           xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:ext="http://midpoint-grouper-integration.itap.internet2.edu"
           oid="5f2b96d2-49b5-4a8a-9601-14457309a69b">
    <name>Grouper-Groups</name>
    <archetypePolicy>
        <display>
            <label>Grouper Group</label>
            <pluralLabel>Grouper Groups</pluralLabel>
            <icon>
                <cssClass>fa-solid fa-fish</cssClass>
                <color>lightcoral</color>
            </icon>
        </display>
    </archetypePolicy>
    <assignment>
        <targetRef oid="bcaec940-50c8-44bb-aa37-b2b5bb2d5b90" relation="org:default" type="c:RoleType" />     <!-- metarole-grouper-provided-group -->
    </assignment>

</archetype>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/archetypes/300-archetype-requestable-role.xml

```typescript
<archetype xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
           xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
           xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
           xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
           xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
           xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
           xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:ext="http://midpoint-grouper-integration.itap.internet2.edu"
           oid="496a0703-affb-421f-9285-c7d3cb12f55e">
    <name>Grouper-Requestable-Role</name>
    <archetypePolicy>
        <display>
            <label>Grouper Requestable Role</label>
            <pluralLabel>Grouper Requestable Roles</pluralLabel>
            <icon>
                <cssClass>fa fa-inbox</cssClass>
                <color>purple</color>
            </icon>
        </display>
    </archetypePolicy>
    <inducement>
        <construction>
            <resourceRef oid="31cef34a-8142-4c5a-bdc7-c769c7cfbba9" relation="org:default" type="c:ResourceType" /> <!-- Grouper Request Registry -->
            <kind>account</kind>
            <intent>default</intent>
            <strength>strong</strength>
            <attribute>
                <ref>ri:grouperRequestGroupMembershipNames</ref>
                <limitations>
                    <maxOccurs>unbounded</maxOccurs>
                </limitations>
                <tolerant>false</tolerant>
                <outbound>
                    <strength>strong</strength>
                    <authoritative>true</authoritative>
                    <source>
                        <path>$assignment/targetRef</path>
                    </source>
                    <source>
                        <path>$focus/extension/uidNumber</path>
                    </source>
                    <source>
                        <path>$assignment/metadata/createApproverRef</path>
                    </source>
                    <source>
                        <path>$assignment/metadata/createTimestamp</path>
                    </source>
                    <source>
                        <path>$assignment/metadata/createApprovalComment</path>
                    </source>
                    <expression>
                        <script>
                            <code>
                                import groovy.json.JsonBuilder
                                import com.evolveum.midpoint.xml.ns._public.common.common_3.RoleType
                                import com.evolveum.midpoint.xml.ns._public.common.common_3.UserType

                                if (targetRef &amp;&amp; targetRef?.getOid() &amp;&amp; uidNumber &amp;&amp; uidNumber?.trim()) {
                                    try {
                                        def groupObj = midpoint.getObject(RoleType.class, targetRef.getOid())
                                        def approverObj = (createApproverRef?.getOid()) ? midpoint.getObject(UserType.class, createApproverRef.getOid()) : null
                                        def approverSubjId = (approverObj) ? basic.getExtensionPropertyValue(approverObj, 'uidNumber') : null
                                        def createDate = (createTimestamp) ? basic.formatDateTime("yyyy-MM-dd HH:mm:ss", createTimestamp) : null
                                        def comment = (createApprovalComment) ?  basic.stringify(createApprovalComment).trim() : null

                                        if (groupObj &amp;&amp; groupObj?.name) {
                                            def grouperRequestObj = [
                                                 "GP": basic.stringify(groupObj.name).trim(),
                                                 "AP": (approverSubjId) ? basic.stringify(approverSubjId).trim() : null,
                                                 "AT": createDate,
                                                 "CM": comment
                                            ]

                                            return new JsonBuilder(grouperRequestObj).toString()
                                        }

                                    } catch (final Exception e) {
                                        log.info("Error building Group Request Group Membership JSON with " + e)
                                    }
                                }
                            </code>
                        </script>
                    </expression>
                </outbound>
            </attribute>
        </construction>
        <condition>
            <source>
                <path>$focus/extension/uidNumber</path>
            </source>
            <expression>
                <script>
                    <code>uidNumber &amp;&amp; uidNumber?.trim() != ""</code>
                </script>
            </expression>
        </condition>
        <orderConstraint>
            <orderMin>2</orderMin>
            <orderMax>unbounded</orderMax>
        </orderConstraint>
        <focusType>UserType</focusType>
    </inducement>
</archetype>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/object-templates/015-object-template-user.xml

```typescript
<?xml version="1.0"?>
<!-- Default Global User Object Template -->
<objectTemplate xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
                xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
                oid="50a11daf-bb7f-4a59-9d42-ce79f1721950">
    <name>VT Global User Template</name>
    <description>
        This is a VT global user Object Template that applies to all User objects in midPoint.
    </description>

    <!-- Set/Compute User's midPoint name field value -->
    <mapping>
        <name>Enforce midPoint name value</name>
        <description>
            midPoint name is used for GUI/Error display in midPoint, for SSO matching to uid sent from IdP, and must be unique per user object in midPoint.

            At VT, the midPoint name field can be:
                [uid number] for new applicants or those without authId,
                [authId] for all normal identities,
                [authId_DUPLICATE#] for cases where authId is duplicate across two or more identities temporarily in midPoint on a authId change.
        </description>
        <strength>strong</strength>
        <source>
            <path>$focus/extension/authId</path>
        </source>
        <source>
            <path>$focus/name</path>
        </source>
        <expression>
            <script>
                <code>
                    if (authId &amp;&amp; authId?.trim()) {
                        def authIdClean = authId.trim()
                        def nameStr = basic.stringify(name)

                        if (!nameStr.equals(authIdClean)) {
                            def idx = 1
                            def newName = authIdClean

                            while (!midpoint.isUniquePropertyValue(focus, 'name', newName)) {
                                newName = authIdClean + "_DUPLICATE" + idx
                                idx++
                            }

                            return newName //Set midPoint name to authId created above.
                        }
                    }
                    return name //fall through to the name set at identity creation in the originating resource mapping.
                </code>
            </script>
        </expression>
        <target>
            <path>name</path>
        </target>
    </mapping>

    <!--Set Previous AuthID -->
    <mapping>
        <name>Set Previous Auth ID on Change</name>
        <description>
            Sets previous authId when it changes on an identity
        </description>
        <strength>strong</strength>
        <source>
            <path>$focus/extension/authId</path>
        </source>
        <source>
            <path>$focus/extension/previousAuthIds</path>
        </source>
        <expression>
            <script>
                <relativityMode>absolute</relativityMode>
                <code>
                    import com.evolveum.midpoint.prism.path.ItemPath;
                    import com.evolveum.midpoint.xml.ns._public.common.common_3.ObjectType;

                    def prevAuthId = (previousAuthIds &amp;&amp; !basic.isEmpty(previousAuthIds)) ? previousAuthIds : []

                    try {
                        if (authId &amp;&amp; authId?.trim()) {
                            //BEGIN NOTE: using midPoint internals/script library; may change. Consult Java docs or source on version changes. Note this does match Evolveum examples and documentation (see Notifications), so this shouldn't change too often.
                            //  Improvement Request: https://support.evolveum.com/projects/midpoint/work_packages/7911; this is not a high priority since the below is the official way to handle this, we'd just like a better GUI/first class way to do it

                            def change = midpoint.focusContext.primaryDelta // primary deltas are typically manual GUI or REST API actions
                            if (midpoint.focusContext.secondaryDelta) {
                                change = midpoint.focusContext.secondaryDelta //typically we want secondary deltas as those are a result of source of truth changes such as from ED ID
                            }

                            def authIdPath = ItemPath.create(ObjectType.F_EXTENSION, "authId")
                            if (change?.isModify() &amp;&amp; change?.hasItemDelta(authIdPath)) {
                                def delta = change.findItemDelta(authIdPath)
                                if (!basic.stringify(delta?.getEstimatedOldValues()?.stream()?.findFirst())?.equals(basic.stringify(delta?.getValuesToReplace()?.stream()?.findFirst()))) {
                                   def oldAuthId = basic.stringify(delta.getEstimatedOldValues().getAt(0).getValue())  //authId was changed and old value does not match new value; return the previous value

                                    if (oldAuthId?.trim() &amp;&amp; !prevAuthId.contains(oldAuthId)) {
                                        prevAuthId.add(oldAuthId)
                                    }
                                }
                            }
                            //END NOTE: using midPoint internals
                        }

                    } catch (final Exception e) {
                        //intentionally catching everything here because this attribute is nice to have and we want the user to continue to process and perform other mappings
                        log.debug("Error in previousAuthIds calculation: for user with authId [" + authId + "] and error: " + e)
                    }

                    return prevAuthId //failsafe we return empty list or the existing list even in error cases since this attribute is nice to have
                </code>
            </script>
        </expression>
        <target>
            <path>$focus/extension/previousAuthIds</path>
            <set>
                <predefined>all</predefined>
            </set>
        </target>
    </mapping>
    <!-- End Set Previous AuthID -->

    <!-- Set/Compute User's FullName -->
    <mapping>
        <name>Set FullName</name>
        <strength>strong</strength>
        <source>
            <path>$focus/givenName</path>
        </source>
        <source>
            <path>$focus/familyName</path>
        </source>
        <expression>
            <script>
                <code>
                    if (givenName &amp;&amp; familyName &amp;&amp; givenName?.trim() != "" &amp;&amp; familyName?.trim() != "") {
                        return givenName + " " + familyName
                    }
                </code>
            </script>
        </expression>
        <target>
            <path>fullName</path>
        </target>
    </mapping>

    <mapping>
        <name>Grouper Group Cleanup</name>
        <description>
            This mapping will remove assignments with grouper-grouper subtype for all users who don't have account linked on Grouper resource.
            This is addressing the situation when a user account on Grouper resource is deleted and therefore is no longer synchronized.
            Also, this will clean up all grouper-group assignments that shouldn't exist. We want such assignments exist only if they exists in Grouper resource.
        </description>
        <strength>strong</strength>
        <expression>
            <script>
                <code>
                    return null
                </code>
            </script>
        </expression>
        <target>
            <path>assignment</path>
            <set>
                <condition>
                    <script>
                        <code>
                            if(!midpoint.hasLinkedAccount('fb0bbf07-e33f-4ddd-85a1-16a7edc237f2')) {
                                return assignment?.subtype?.contains('grouper-group')
                            } else {
                                return false
                            }
                        </code>
                    </script>
                </condition>
            </set>
        </target>
    </mapping>
    <mapping>
        <name>AD User Account Cleanup</name>
        <description>
            This mapping will remove AD User Account assignment if the user no longer exists in AD. Birthright is given by AD itself so this closes the loop.
        </description>
        <strength>strong</strength>
        <expression>
            <script>
                <code>
                    return null
                </code>
            </script>
        </expression>
        <target>
            <path>assignment</path>
            <set>
                <condition>
                    <script>
                        <code>
                            if(!midpoint.hasLinkedAccount('728904ad-59ed-4473-bfac-dc6aebd26d6e')) {
                                return assignment?.subtype?.contains('ad-person')
                            } else {
                                return false
                            }
                        </code>
                    </script>
                </condition>
            </set>
        </target>
    </mapping>

</objectTemplate>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/object-templates/100-object-template-role.xml

```typescript
<?xml version="1.0"?>
<!-- Default Role Object Template -->
<objectTemplate xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
                xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                oid="8bf9c2c4-a458-457a-a36b-fe57e6c351c4">
    <name>VT Global Role Template</name>
    <description>
        This is a VT global role Object Template that applies to all Role objects in midPoint.
    </description>

    <!-- Assign Requestable Role Archetype which assigns to Grouper Request Resource and sends to Grouper. -->
    <mapping>
        <name>Requestable Role Mapping</name>
        <strength>strong</strength>
        <source>
            <path>$focus/costCenter</path>
        </source>
        <expression>
            <assignmentTargetSearch>
                <targetType>ArchetypeType</targetType>
                <oid>496a0703-affb-421f-9285-c7d3cb12f55e</oid>
            </assignmentTargetSearch>
        </expression>
        <target>
            <path>assignment</path>
        </target>
        <condition>
            <script>
                <code>
                    costCenter?.trim()?.equalsIgnoreCase("mp_to_grouper_request_role")
                </code>
            </script>
        </condition>
    </mapping>

</objectTemplate>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/resources/100-inbound-grouper-groups.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<resource xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
          xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
          xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
          xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
          xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          oid="fb0bbf07-e33f-4ddd-85a1-16a7edc237f2">
    <name>Inbound Grouper Groups</name>
    <connectorRef relation="org:default" type="c:ConnectorType">
        <filter>
            <q:and>
                <q:equal>
                    <q:path>c:connectorType</q:path>
                    <q:value>com.evolveum.polygon.connector.grouper.GrouperConnector</q:value>
                </q:equal>
                <q:equal>
                    <q:path>c:connectorVersion</q:path>
                    <q:value>1.2.0.1</q:value>
                </q:equal>
            </q:and>
        </filter>
    </connectorRef>
    <connectorConfiguration xmlns:icfc="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/connector-schema-3">
        <icfc:configurationProperties xmlns:grpconf="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/bundle/com.evolveum.polygon.connector-grouper/com.evolveum.polygon.connector.grouper.GrouperConnector">
            <grpconf:host>GROUPER_DB_HOST</grpconf:host>
            <grpconf:port>5432</grpconf:port>
            <grpconf:userName>GROUPER_DB_USER</grpconf:userName>
            <grpconf:password><t:clearValue>GROUPER_DB_PASSWORD</t:clearValue></grpconf:password>
            <grpconf:databaseName>grouper</grpconf:databaseName>
            <grpconf:schema>gr_to_mp</grpconf:schema>
            <grpconf:tablePrefix>gr</grpconf:tablePrefix>
            <grpconf:attrsToHaveInAllSearch>members</grpconf:attrsToHaveInAllSearch>
            <grpconf:attrsToHaveInAllSearch>member_of</grpconf:attrsToHaveInAllSearch>
            <grpconf:extendedGroupProperties>emailListName</grpconf:extendedGroupProperties>
        </icfc:configurationProperties>
        <icfc:resultsHandlerConfiguration>
            <icfc:enableNormalizingResultsHandler>false</icfc:enableNormalizingResultsHandler>
            <icfc:enableFilteredResultsHandler>false</icfc:enableFilteredResultsHandler>
            <icfc:enableAttributesToGetSearchResultsHandler>false</icfc:enableAttributesToGetSearchResultsHandler>
        </icfc:resultsHandlerConfiguration>
    </connectorConfiguration>
    <schema></schema>
    <schemaHandling>
        <objectType>
            <kind>account</kind>
            <intent>default</intent>
            <displayName>Default Account</displayName>
            <default>true</default>
            <delineation>
                <objectClass>ri:subject</objectClass>
            </delineation>
            <focus>
                <type>c:UserType</type>
            </focus>
            <attribute>
                <ref>ri:subject_id</ref>
                <inbound>
                    <strength>weak</strength>
                    <target>
                        <path>extension/uidNumber</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>icfs:uid</ref>
            </attribute>
            <attribute>
                <ref>ri:member_of</ref>
                <fetchStrategy>explicit</fetchStrategy>
            </attribute>
            <association>
                <ref>ri:group</ref>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <assignmentTargetSearch>
                            <targetType>c:RoleType</targetType>
                            <filter>
                                <q:equal>
                                    <q:path>identifier</q:path>
                                    <expression>
                                        <script>
                                            <code>

                                                def attrs = entitlement?.getAttributes();
                                                if (attrs) {
                                                    pcvi = attrs?.asPrismContainerValue()?.getItems();
                                                    def groupName;

                                                    for (obj in pcvi){
                                                        if (obj?.isSingleValue()){

                                                            if("uid".equals(obj?.getElementName().toString())){

                                                                groupName = obj?.getValue()?.getRealValue()
                                                                return groupName
                                                            }
                                                        }
                                                    }
                                                    return groupName;
                                                }
                                            </code>
                                        </script>
                                    </expression>
                                </q:equal>
                            </filter>
                            <populate>
                                <populateItem>
                                    <expression>
                                        <value>grouper-group</value>
                                    </expression>
                                    <target>
                                        <path>subtype</path>
                                    </target>
                                </populateItem>
                            </populate>
                        </assignmentTargetSearch>
                    </expression>
                    <target>
                        <path>assignment</path>
                        <set>
                            <condition>
                                <script>
                                    <code>
                                        assignment?.subtype?.contains('grouper-group')
                                    </code>
                                </script>
                            </condition>
                        </set>
                    </target>
                </inbound>
                <kind>entitlement</kind>
                <intent>group</intent>
                <direction>objectToSubject</direction>
                <associationAttribute>ri:members</associationAttribute>
                <valueAttribute>icfs:uid</valueAttribute>
                <shortcutAssociationAttribute>ri:member_of</shortcutAssociationAttribute>
                <shortcutValueAttribute>icfs:uid</shortcutValueAttribute>
                <explicitReferentialIntegrity>false</explicitReferentialIntegrity>
            </association>
            <correlation>
                <correlators>
                    <items>
                        <name>unique_index</name>
                        <item>
                            <ref>extension/uidNumber</ref>
                        </item>
                    </items>
                </correlators>
            </correlation>
            <synchronization>
                <reaction>
                    <situation>unmatched</situation>
                </reaction>
                <reaction>
                    <situation>unlinked</situation>
                    <actions>
                        <link>
                            <synchronize>true</synchronize>
                        </link>
                    </actions>
                </reaction>
                <reaction>
                    <situation>linked</situation>
                    <actions>
                        <synchronize/>
                    </actions>
                </reaction>
                <reaction>
                    <situation>deleted</situation>
                    <actions>
                        <synchronize/>
                    </actions>
                </reaction>
            </synchronization>
        </objectType>
        <objectType>
            <kind>entitlement</kind>
            <intent>group</intent>
            <displayName>Group</displayName>
            <default>true</default>
            <delineation>
                <objectClass>ri:group</objectClass>
            </delineation>
            <focus>
                <type>c:RoleType</type>
            </focus>
            <attribute>
                <ref>icfs:uid</ref>
                <inbound>
                    <strength>strong</strength>
                    <target>
                        <path>identifier</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:group_name</ref>
                <inbound>
                    <strength>strong</strength>
                    <target>
                        <path>name</path>
                    </target>
                </inbound>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <script>
                            <code>
                                import com.evolveum.midpoint.schema.util.*
                                import com.evolveum.midpoint.schema.constants.*

                                if (input == null) {
                                    null
                                } else {
                                    archetypeOid = '5f2b96d2-49b5-4a8a-9601-14457309a69b'       // generic-grouper-group archetype
                                    switch (input) {
                                        case ~/^.*-approvers/: archetypeOid = '845ea5b1-2ab1-42db-9c47-9ed770a26973'; break;   // requestable role approver archetype
                                        case ~/^dpt:ccs:app:hokies:.*:adsec:.*/: archetypeOid = '96ed6c50-1057-4b31-bd31-d1edb160af86'; break;                                    }
                                    ObjectTypeUtil.createAssignmentTo(archetypeOid, ObjectTypes.ARCHETYPE, prismContext)
                                }
                            </code>
                        </script>
                    </expression>
                    <target>
                        <path>assignment</path>
                        <set>
                            <predefined>all</predefined>
                        </set>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:display_name</ref>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <script>
                            <code>
                                if (input?.contains(":")) {
                                    return input.substring(input.lastIndexOf(":")+1,input.length()).trim()
                                }
                            </code>
                        </script>
                    </expression>
                    <target>
                        <path>$focus/displayName</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:description</ref>
                <inbound>
                    <strength>strong</strength>
                    <target>
                        <path>$focus/description</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:members</ref>
                <fetchStrategy>explicit</fetchStrategy>
            </attribute>
            <correlation>
                <correlators>
                    <items>
                        <name>unique_index</name>
                        <item>
                            <ref>identifier</ref>
                        </item>
                    </items>
                </correlators>
            </correlation>
            <synchronization>
                <reaction>
                    <situation>unmatched</situation>
                    <actions>
                        <addFocus>
                            <synchronize>true</synchronize>
                        </addFocus>
                    </actions>
                </reaction>
                <reaction>
                    <situation>unlinked</situation>
                    <actions>
                        <link>
                            <synchronize>true</synchronize>
                        </link>
                    </actions>
                </reaction>
                <reaction>
                    <situation>linked</situation>
                    <actions>
                        <synchronize/>
                    </actions>
                </reaction>
                <reaction>
                    <situation>deleted</situation>
                    <actions>
                        <deleteFocus>
                            <synchronize>true</synchronize>
                        </deleteFocus>
                    </actions>
                </reaction>
            </synchronization>
        </objectType>
    </schemaHandling>
</resource>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/resources/100-inbound-users-ad-ldap.xml

```typescript
<resource xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
          xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
          xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
          xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
          xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          oid="01e181eb-c12f-4002-ae69-2090ec3601fd" version="2">
    <name>AD Dev Subject Source</name>
    <lifecycleState>active</lifecycleState>
    <iteration>0</iteration>
    <iterationToken/>
    <connectorRef oid="a6dc1b97-f0c0-470d-a680-c874655aee22" relation="org:default" type="c:ConnectorType">
        <!-- ConnId com.evolveum.polygon.connector.ldap.ad.AdLdapConnector v3.7 -->
    </connectorRef>
    <connectorConfiguration xmlns:icfc="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/connector-schema-3">
        <icfc:configurationProperties xmlns:gen159="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/bundle/com.evolveum.polygon.connector-ldap/com.evolveum.polygon.connector.ldap.ad.AdLdapConnector">
            <gen159:host>LDAP_HOST</gen159:host>
            <gen159:port>389</gen159:port>
            <gen159:connectionSecurity>starttls</gen159:connectionSecurity>
            <gen159:bindDn>LDAP_BIND_DN</gen159:bindDn>
            <gen159:bindPassword><t:clearValue>LDAP_BIND_PASSWORD</t:clearValue></gen159:bindPassword>
            <gen159:baseContext>LDAP_BASE_DN</gen159:baseContext>
        </icfc:configurationProperties>
    </connectorConfiguration>
    <schema>
        <generationConstraints>
            <generateObjectClass>ri:organizationalPerson</generateObjectClass>
        </generationConstraints>
        <definition>
            <xsd:schema xmlns:a="http://prism.evolveum.com/xml/ns/public/annotation-3" xmlns:ra="http://midpoint.evolveum.com/xml/ns/public/resource/annotation-3" xmlns:tns="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" xmlns:xsd="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" targetNamespace="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3">
                <xsd:import namespace="http://prism.evolveum.com/xml/ns/public/annotation-3"/>
                <xsd:import namespace="http://midpoint.evolveum.com/xml/ns/public/resource/annotation-3"/>
                <xsd:complexType name="organizationalPerson">
                    <xsd:annotation>
                        <xsd:appinfo>
                            <a:container/>
                            <ra:resourceObject/>
                            <ra:identifier>ri:objectGUID</ra:identifier>
                            <ra:secondaryIdentifier>ri:dn</ra:secondaryIdentifier>
                            <ra:displayNameAttribute>ri:dn</ra:displayNameAttribute>
                            <ra:namingAttribute>ri:dn</ra:namingAttribute>
                            <ra:nativeObjectClass>organizationalPerson</ra:nativeObjectClass>
                        </xsd:appinfo>
                    </xsd:annotation>
                    <xsd:sequence>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="memberOf" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>memberOf</a:displayName>
                                    <a:displayOrder>130</a:displayOrder>
                                    <a:access>read</a:access>
                                    <a:matchingRule xmlns:qn268="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn268:distinguishedName</a:matchingRule>
                                    <ra:nativeAttributeName>memberOf</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>memberOf</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="department" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>department</a:displayName>
                                    <a:displayOrder>280</a:displayOrder>
                                    <ra:nativeAttributeName>department</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>department</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="countryCode" type="xsd:integer">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>countryCode</a:displayName>
                                    <a:displayOrder>330</a:displayOrder>
                                    <ra:nativeAttributeName>countryCode</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>countryCode</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="c" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>c</a:displayName>
                                    <a:displayOrder>380</a:displayOrder>
                                    <ra:nativeAttributeName>c</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>c</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="l" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>l</a:displayName>
                                    <a:displayOrder>430</a:displayOrder>
                                    <ra:nativeAttributeName>l</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>l</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="telephoneNumber" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>telephoneNumber</a:displayName>
                                    <a:displayOrder>440</a:displayOrder>
                                    <ra:nativeAttributeName>telephoneNumber</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>telephoneNumber</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="o" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>o</a:displayName>
                                    <a:displayOrder>450</a:displayOrder>
                                    <ra:nativeAttributeName>o</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>o</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="description" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>description</a:displayName>
                                    <a:displayOrder>470</a:displayOrder>
                                    <ra:nativeAttributeName>description</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>description</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="sn" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>sn</a:displayName>
                                    <a:displayOrder>520</a:displayOrder>
                                    <ra:nativeAttributeName>sn</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>sn</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="createTimeStamp" type="xsd:dateTime">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>createTimeStamp</a:displayName>
                                    <a:displayOrder>580</a:displayOrder>
                                    <a:access>read</a:access>
                                    <ra:nativeAttributeName>createTimeStamp</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>createTimeStamp</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="st" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>st</a:displayName>
                                    <a:displayOrder>590</a:displayOrder>
                                    <ra:nativeAttributeName>st</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>st</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element name="cn" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>cn</a:displayName>
                                    <a:displayOrder>620</a:displayOrder>
                                    <a:matchingRule xmlns:qn984="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn984:stringIgnoreCase</a:matchingRule>
                                    <ra:nativeAttributeName>cn</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>cn</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="street" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>street</a:displayName>
                                    <a:displayOrder>630</a:displayOrder>
                                    <ra:nativeAttributeName>street</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>street</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="homePhone" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>homePhone</a:displayName>
                                    <a:displayOrder>790</a:displayOrder>
                                    <ra:nativeAttributeName>homePhone</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>homePhone</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="displayName" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>displayName</a:displayName>
                                    <a:displayOrder>870</a:displayOrder>
                                    <ra:nativeAttributeName>displayName</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>displayName</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="employeeID" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>employeeID</a:displayName>
                                    <a:displayOrder>930</a:displayOrder>
                                    <ra:nativeAttributeName>employeeID</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>employeeID</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="subSchemaSubEntry" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>subSchemaSubEntry</a:displayName>
                                    <a:displayOrder>1050</a:displayOrder>
                                    <a:access>read</a:access>
                                    <a:matchingRule xmlns:qn967="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn967:distinguishedName</a:matchingRule>
                                    <ra:nativeAttributeName>subSchemaSubEntry</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>subSchemaSubEntry</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="name" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>name</a:displayName>
                                    <a:displayOrder>1060</a:displayOrder>
                                    <a:access>read</a:access>
                                    <ra:nativeAttributeName>name</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>name</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="objectCategory" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>objectCategory</a:displayName>
                                    <a:displayOrder>1070</a:displayOrder>
                                    <a:matchingRule xmlns:qn146="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn146:distinguishedName</a:matchingRule>
                                    <ra:nativeAttributeName>objectCategory</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>objectCategory</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="facsimileTelephoneNumber" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>facsimileTelephoneNumber</a:displayName>
                                    <a:displayOrder>1150</a:displayOrder>
                                    <ra:nativeAttributeName>facsimileTelephoneNumber</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>facsimileTelephoneNumber</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="employeeNumber" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>employeeNumber</a:displayName>
                                    <a:displayOrder>1250</a:displayOrder>
                                    <ra:nativeAttributeName>employeeNumber</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>employeeNumber</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="givenName" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>givenName</a:displayName>
                                    <a:displayOrder>1310</a:displayOrder>
                                    <ra:nativeAttributeName>givenName</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>givenName</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="thumbnailLogo" type="xsd:base64Binary">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>thumbnailLogo</a:displayName>
                                    <a:displayOrder>1330</a:displayOrder>
                                    <ra:nativeAttributeName>thumbnailLogo</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>thumbnailLogo</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="streetAddress" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>streetAddress</a:displayName>
                                    <a:displayOrder>1430</a:displayOrder>
                                    <ra:nativeAttributeName>streetAddress</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>streetAddress</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="title" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>title</a:displayName>
                                    <a:displayOrder>1460</a:displayOrder>
                                    <ra:nativeAttributeName>title</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>title</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="thumbnailPhoto" type="xsd:base64Binary">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>thumbnailPhoto</a:displayName>
                                    <a:displayOrder>1470</a:displayOrder>
                                    <ra:nativeAttributeName>thumbnailPhoto</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>thumbnailPhoto</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="initials" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>initials</a:displayName>
                                    <a:displayOrder>1520</a:displayOrder>
                                    <ra:nativeAttributeName>initials</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>initials</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="homePostalAddress" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>homePostalAddress</a:displayName>
                                    <a:displayOrder>1660</a:displayOrder>
                                    <ra:nativeAttributeName>homePostalAddress</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>homePostalAddress</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="modifyTimeStamp" type="xsd:dateTime">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>modifyTimeStamp</a:displayName>
                                    <a:displayOrder>1730</a:displayOrder>
                                    <a:access>read</a:access>
                                    <ra:nativeAttributeName>modifyTimeStamp</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>modifyTimeStamp</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="pager" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>pager</a:displayName>
                                    <a:displayOrder>1750</a:displayOrder>
                                    <ra:nativeAttributeName>pager</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>pager</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="structuralObjectClass" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>structuralObjectClass</a:displayName>
                                    <a:displayOrder>1760</a:displayOrder>
                                    <ra:nativeAttributeName>structuralObjectClass</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>structuralObjectClass</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="postalAddress" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>postalAddress</a:displayName>
                                    <a:displayOrder>1870</a:displayOrder>
                                    <ra:nativeAttributeName>postalAddress</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>postalAddress</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="url" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>url</a:displayName>
                                    <a:displayOrder>2020</a:displayOrder>
                                    <ra:nativeAttributeName>url</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>url</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element name="dn" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>dn</a:displayName>
                                    <a:displayOrder>110</a:displayOrder>
                                    <a:matchingRule xmlns:qn135="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn135:distinguishedName</a:matchingRule>
                                    <ra:nativeAttributeName>dn</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>__NAME__</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="mobile" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>mobile</a:displayName>
                                    <a:displayOrder>2240</a:displayOrder>
                                    <ra:nativeAttributeName>mobile</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>mobile</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="middleName" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>middleName</a:displayName>
                                    <a:displayOrder>2400</a:displayOrder>
                                    <ra:nativeAttributeName>middleName</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>middleName</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="mail" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>mail</a:displayName>
                                    <a:displayOrder>2410</a:displayOrder>
                                    <ra:nativeAttributeName>mail</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>mail</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="employeeType" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>employeeType</a:displayName>
                                    <a:displayOrder>2620</a:displayOrder>
                                    <ra:nativeAttributeName>employeeType</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>employeeType</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element maxOccurs="unbounded" minOccurs="0" name="postOfficeBox" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>postOfficeBox</a:displayName>
                                    <a:displayOrder>2650</a:displayOrder>
                                    <ra:nativeAttributeName>postOfficeBox</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>postOfficeBox</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="postalCode" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>postalCode</a:displayName>
                                    <a:displayOrder>2750</a:displayOrder>
                                    <ra:nativeAttributeName>postalCode</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>postalCode</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="ou" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>ou</a:displayName>
                                    <a:displayOrder>2770</a:displayOrder>
                                    <a:matchingRule xmlns:qn201="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn201:stringIgnoreCase</a:matchingRule>
                                    <ra:nativeAttributeName>ou</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>ou</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="distinguishedName" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>distinguishedName</a:displayName>
                                    <a:displayOrder>2850</a:displayOrder>
                                    <a:access>read</a:access>
                                    <a:matchingRule xmlns:qn876="http://prism.evolveum.com/xml/ns/public/matching-rule-3">qn876:distinguishedName</a:matchingRule>
                                    <ra:nativeAttributeName>distinguishedName</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>distinguishedName</ra:frameworkAttributeName>
                                    <ra:returnedByDefault>false</ra:returnedByDefault>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:element minOccurs="0" name="objectGUID" type="xsd:string">
                            <xsd:annotation>
                                <xsd:appinfo>
                                    <a:displayName>objectGUID</a:displayName>
                                    <a:displayOrder>100</a:displayOrder>
                                    <a:access>read</a:access>
                                    <ra:nativeAttributeName>objectGUID</ra:nativeAttributeName>
                                    <ra:frameworkAttributeName>__UID__</ra:frameworkAttributeName>
                                </xsd:appinfo>
                            </xsd:annotation>
                        </xsd:element>
                        <xsd:any maxOccurs="unbounded" minOccurs="0" namespace="##other" processContents="lax"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:schema>
        </definition>
    </schema>
    <capabilities>
        <native xmlns:cap="http://midpoint.evolveum.com/xml/ns/public/resource/capabilities-3">
            <cap:schema/>
            <cap:discoverConfiguration/>
            <cap:activation>
                <cap:status/>
            </cap:activation>
            <cap:credentials>
                <cap:password>
                    <cap:returnedByDefault>false</cap:returnedByDefault>
                </cap:password>
            </cap:credentials>
            <cap:liveSync/>
            <cap:create/>
            <cap:read>
                <cap:returnDefaultAttributesOption>true</cap:returnDefaultAttributesOption>
            </cap:read>
            <cap:update>
                <cap:delta>true</cap:delta>
                <cap:addRemoveAttributeValues>true</cap:addRemoveAttributeValues>
            </cap:update>
            <cap:delete/>
            <cap:testConnection/>
            <cap:script>
                <cap:host id="2">
                    <cap:type>connector</cap:type>
                </cap:host>
            </cap:script>
            <cap:pagedSearch/>
            <cap:auxiliaryObjectClasses/>
        </native>
    </capabilities>
</resource>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/resources/100-inbound-users-ed-id-ldap.xml

```typescript
<resource xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
          xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
          xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
          xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
          xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          oid="534a8b3e-e05a-46ed-8a71-3f9ce98656c5" version="1">
    <name>ED ID Dev Subject Source</name>
    <connectorRef relation="org:default" type="c:ConnectorType">
        <filter>
            <q:equal>
                <q:path>connectorType</q:path>
                <q:value>edu.vt.midpoint.connector.ldaptive.LdapConnector</q:value>
                <!-- ConnId edu.vt.midpoint.connector.ldaptive.LdapConnector v1.0.0-SNAPSHOT -->
            </q:equal>
        </filter>
    </connectorRef>
    <connectorConfiguration xmlns:icfc="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/connector-schema-3">
        <icfc:configurationProperties xmlns:gen289="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/bundle/edu.vt.midpoint.ldaptive-connector/edu.vt.midpoint.connector.ldaptive.LdapConnector">
            <gen289:ldapUrl>ldap://LDAP_URL</gen289:ldapUrl>
            <gen289:useStartTLS>true</gen289:useStartTLS>
            <gen289:trustStorePath>file:/opt/midpoint/var/incommon-truststore.jks</gen289:trustStorePath>
            <gen289:trustStoreType>JKS</gen289:trustStoreType>
            <gen289:trustStorePassword><t:clearValue>changeit</t:clearValue></gen289:trustStorePassword>
            <gen289:keyStorePath>file:/opt/midpoint/var/midpoint.p12</gen289:keyStorePath>
            <gen289:keyStoreType>PKCS12</gen289:keyStoreType>
            <gen289:keyStorePassword><t:clearValue>KEYSTORE_PASSWORD</t:clearValue></gen289:keyStorePassword>
            <gen289:bindStrategy>EXTERNAL</gen289:bindStrategy>
            <gen289:baseDn>ou=people,dc=vt,dc=edu</gen289:baseDn>
            <gen289:searchScope>ONELEVEL</gen289:searchScope>
            <gen289:searchFilter>(authId=*)</gen289:searchFilter>
            <gen289:returnAttributes>authId</gen289:returnAttributes>
            <gen289:returnAttributes>cn</gen289:returnAttributes>
            <gen289:returnAttributes>eduPersonAffiliation</gen289:returnAttributes>
            <gen289:returnAttributes>virginiaTechAffiliation</gen289:returnAttributes>
            <gen289:returnAttributes>givenName</gen289:returnAttributes>
            <gen289:returnAttributes>sn</gen289:returnAttributes>
            <gen289:returnAttributes>uid</gen289:returnAttributes>
            <gen289:returnAttributes>uupid</gen289:returnAttributes>
            <gen289:returnAttributes>virginiaTechID</gen289:returnAttributes>
            <gen289:nameAttribute>entryDN</gen289:nameAttribute>
            <gen289:uidAttribute>entryUUID</gen289:uidAttribute>
        </icfc:configurationProperties>
        <icfc:resultsHandlerConfiguration>
            <icfc:enableNormalizingResultsHandler>false</icfc:enableNormalizingResultsHandler>
            <icfc:enableFilteredResultsHandler>false</icfc:enableFilteredResultsHandler>
            <icfc:enableAttributesToGetSearchResultsHandler>false</icfc:enableAttributesToGetSearchResultsHandler>
        </icfc:resultsHandlerConfiguration>
        <icfc:timeouts>
            <icfc:create>180000</icfc:create>
            <icfc:get>180000</icfc:get>
            <icfc:update>180000</icfc:update>
            <icfc:delete>180000</icfc:delete>
            <icfc:test>60000</icfc:test>
            <icfc:scriptOnConnector>180000</icfc:scriptOnConnector>
            <icfc:scriptOnResource>180000</icfc:scriptOnResource>
            <icfc:authentication>60000</icfc:authentication>
            <icfc:search>180000</icfc:search>
            <icfc:validate>180000</icfc:validate>
            <icfc:sync>180000</icfc:sync>
            <icfc:schema>60000</icfc:schema>
        </icfc:timeouts>
    </connectorConfiguration>
    <schema>
        <generationConstraints>
            <generateObjectClass>ri:inetOrgPerson</generateObjectClass>
            <generateObjectClass>ri:eduPerson</generateObjectClass>
            <generateObjectClass>ri:person</generateObjectClass>
            <generateObjectClass>ri:organizationalPerson</generateObjectClass>
            <generateObjectClass>ri:top</generateObjectClass>
            <generateObjectClass>ri:virginiaTechPerson</generateObjectClass>
        </generationConstraints>
    </schema>
    <schemaHandling>
        <objectType>
            <kind>account</kind>
            <displayName>Virginia Tech Person</displayName>
            <default>true</default>
            <auxiliaryObjectClassMappings>
                <tolerant>true</tolerant>
            </auxiliaryObjectClassMappings>
            <delineation>
                <objectClass>ri:virginiaTechPerson</objectClass>
            </delineation>
            <focus>
                <type>c:UserType</type>
            </focus>
            <attribute>
                <ref>ri:cn</ref>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <script>
                            <relativityMode>absolute</relativityMode>
                            <code>
                                if (input?.size() &gt; 0) {
                                    return basic.stringify(input?.get(0))?.trim() //have to pick one
                                } else {
                                    return basic.stringify(input)?.trim()
                                }
                            </code>
                        </script>
                    </expression>
                    <target>
                        <path>fullName</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:givenName</ref>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <script>
                            <relativityMode>absolute</relativityMode>
                            <code>
                                if (input?.size() &gt; 0) {
                                    return basic.stringify(input?.get(0))?.trim() //have to pick one
                                } else {
                                    return basic.stringify(input)?.trim()
                                }
                            </code>
                        </script>
                    </expression>
                    <target>
                        <path>givenName</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:sn</ref>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <script>
                            <relativityMode>absolute</relativityMode>
                            <code>
                                if (input?.size() &gt; 0) {
                                    return basic.stringify(input?.get(0))?.trim() //have to pick one
                                } else {
                                    return basic.stringify(input)?.trim()
                                }
                            </code>
                        </script>
                    </expression>
                    <target>
                        <path>familyName</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:uid</ref>
                <inbound>
                    <strength>weak</strength> <!-- If the identity is new, set name for the first time as uid, object template will update based on authId when it's available -->
                    <target>
                        <path>name</path>
                    </target>
                </inbound>
                <inbound>
                    <strength>strong</strength>
                    <target>
                        <path>personalNumber</path>
                    </target>
                </inbound>
                <inbound>
                    <strength>strong</strength> <!-- This is the VT primary identity identifier and always updated from ED ID -->
                    <target>
                        <path>extension/uidNumber</path>
                    </target>
                </inbound>
                <outbound>
                    <strength>weak</strength> <!-- This is not needed in 4.8+; "use for correlation" is a new feature, but keeping here just in case, this tells midPoint how to convert the uid for comparison purposes when considering a new identity or not! -->
                    <source>
                        <path>extension/uidNumber</path>
                    </source>
                </outbound>
            </attribute>
            <attribute>
                <ref>ri:authId</ref>
                <inbound>
                    <strength>strong</strength>
                    <target>
                        <path>extension/authId</path>
                    </target>
                </inbound>
            </attribute>
            <correlation>
                <correlators>
                    <items>
                        <enabled>true</enabled>
                        <item>
                            <ref>extension/uidNumber</ref>
                        </item>
                    </items>
                </correlators>
            </correlation>
            <synchronization>
                <reaction>
                    <situation>linked</situation>
                    <actions>
                        <synchronize />
                    </actions>
                </reaction>
                <reaction>
                    <situation>unlinked</situation>
                    <actions>
                        <link />
                    </actions>
                </reaction>
                <reaction>
                    <situation>unmatched</situation>
                    <actions>
                        <addFocus />
                    </actions>
                </reaction>
                <reaction>
                    <situation>deleted</situation>
                    <actions>
                        <unlink />
                    </actions>
                </reaction>
            </synchronization>
        </objectType>
    </schemaHandling>
    <capabilities>
        <native xmlns:cap="http://midpoint.evolveum.com/xml/ns/public/resource/capabilities-3">
            <cap:schema/>
            <cap:liveSync/>
            <cap:read>
                <cap:returnDefaultAttributesOption>true</cap:returnDefaultAttributesOption>
            </cap:read>
            <cap:testConnection/>
            <cap:script>
                <cap:host>
                    <cap:type>connector</cap:type>
                </cap:host>
            </cap:script>
            <cap:pagedSearch/>
        </native>
    </capabilities>
    <consistency>
        <avoidDuplicateValues>true</avoidDuplicateValues>
    </consistency>
</resource>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/resources/100-outbound-ad-security-groups.xml

```typescript
<resource xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3" xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3" xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3" xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3" xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3" xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" oid="728904ad-59ed-4473-bfac-dc6aebd26d6e" version="2">
    <name>Outbound AD Security groups</name>
    <lifecycleState>active</lifecycleState>
    <connectorRef relation="org:default" type="c:ConnectorType">
        <description>
            Use AD LDAP Connector
        </description>
        <filter>
            <q:equal>
                <q:path>connectorType</q:path>
                <q:value>com.evolveum.polygon.connector.ldap.ad.AdLdapConnector</q:value>
            </q:equal>
        </filter>
    </connectorRef>
    <connectorConfiguration xmlns:icfc="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/connector-schema-3">
        <icfc:configurationProperties xmlns:gen255="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/bundle/com.evolveum.polygon.connector-ldap/com.evolveum.polygon.connector.ldap.ad.AdLdapConnector">
            <gen255:host>LDAP_HOST</gen255:host>
            <gen255:port>636</gen255:port>
            <gen255:connectionSecurity>ssl</gen255:connectionSecurity>
            <gen255:bindDn>LDAP_BIND_DN</gen255:bindDn>
            <gen255:bindPassword>
                <t:clearValue>LDAP_BIND_PASSWORD</t:clearValue>
            </gen255:bindPassword>
            <gen255:baseContext>LDAP_BASE_DN</gen255:baseContext>
            <gen255:pagingStrategy>spr</gen255:pagingStrategy>
            <gen255:pagingBlockSize>15</gen255:pagingBlockSize>
            <gen255:uidAttribute>objectGUID</gen255:uidAttribute>
            <gen255:filterOutMemberOfValues>true</gen255:filterOutMemberOfValues>
            <gen255:memberOfAllowedValues>AD_BASE_DN_OUTBOUND</gen255:memberOfAllowedValues>
        </icfc:configurationProperties>
    </connectorConfiguration>
    <schema>
        <generationConstraints>
            <generateObjectClass>ri:group</generateObjectClass>
            <generateObjectClass>ri:user</generateObjectClass>
        </generationConstraints>
    </schema>
    <schemaHandling>
        <objectType>
            <kind>entitlement</kind>
            <intent>group</intent>
            <displayName>AD Security Group</displayName>
            <default>false</default>
            <delineation>
                <objectClass>ri:group</objectClass>
                <searchHierarchyScope>sub</searchHierarchyScope>
                <filter>
                    <q:text>attributes/groupType = "-2147483646"</q:text>
                </filter>
                <baseContext>
                    <objectClass>ri:group</objectClass>
                    <filter>
                        <q:text>attributes/dn = "AD_BASE_DN_OUTBOUND"</q:text>
                    </filter>
                </baseContext>
            </delineation>
            <focus>
                <type>c:RoleType</type>
                <archetypeRef oid="96ed6c50-1057-4b31-bd31-d1edb160af86" relation="org:default" type="c:ArchetypeType"/>
            </focus>
            <attribute>
                <ref>ri:dn</ref>
                <displayName>Distinguished Name</displayName>
                <modificationPriority>0</modificationPriority>
                <secondaryIdentifier>true</secondaryIdentifier>
                <volatilityTrigger>true</volatilityTrigger>
                <displayNameAttribute>true</displayNameAttribute>
                <outbound>
                    <name>set-dn</name>
                    <lifecycleState>active</lifecycleState>
                    <source>
                        <path>$focus/name</path>
                    </source>
                    <expression>
                        <script>
                            <code>
                                import com.evolveum.midpoint.util.exception.ExpressionEvaluationException
                                import com.evolveum.midpoint.util.exception.ObjectNotFoundException

                                String baseContext
                                String errorMsg
                                try {
                                    try {
                                        baseContext = basic.getResourceIcfConfigurationPropertyValue(resource, 'baseContext')
                                    } catch ( ObjectNotFoundException onf){
                                        errorMsg = "Empty \"Base Context\" attribute in resource configuration. Non empty value is required.\n" + onf.getMessage()
                                        log.error(errorMsg)
                                        throw new ObjectNotFoundException(errorMsg)
                                    }
                                    // Extract OU and appName from the Grouper name
                                    String groupName = basic.stringify(name)
                                    int startIndex = groupName.indexOf("dpt:ccs:app:hokies:")
                                    if (startIndex &gt;= 0) {
                                        groupName = groupName.substring(startIndex + "dpt:ccs:app:hokies:".length()).replace(":", ".")
                                    } else {
                                        throw new ExpressionEvaluationException("name does not contain expected prefix 'dpt:ccs:app:hokies:'.")
                                    }

                                    // Extract the OU from the group name (e.g., 'sis' in 'sis.adsec.app1')
                                    String ouPart = groupName.split("\\.")[0]
                                    String DN = "CN=" + groupName + ",OU=" + ouPart + "," + baseContext
                                    // Construct the DN
                                    return DN

                                } catch (ExpressionEvaluationException expErr) {
                                    errorMsg = "Failed return value in outbound expression of attribute in resource configuration.\n" + expErr.getMessage()
                                    log.error(errorMsg)
                                    throw new ExpressionEvaluationException(errorMsg)
                                }
                            </code>
                        </script>
                    </expression>
                </outbound>
            </attribute>
            <attribute>
                <ref>ri:displayName</ref>
                <limitations>
                    <minOccurs>0</minOccurs>
                </limitations>
                <outbound>
                    <source>
                        <path>$focus/name</path>
                    </source>
                    <expression>
                        <script>
                            <code>
                                import com.evolveum.midpoint.util.exception.ExpressionEvaluationException;

                                // Find the index of the prefix 'dpt:ccs:app:hokies:'
                                String name = basic.stringify(name);
                                int startIndex = name.indexOf("dpt:ccs:app:hokies:");

                                // If the prefix is found, extract the substring
                                if (startIndex &gt;= 0) {
                                    // Extract everything after the prefix
                                    String appName = name.substring(startIndex + "dpt:ccs:app:hokies:".length());

                                    // Replace colons with periods
                                    return appName.replace(":", ".");
                                } else {
                                    // Handle the case where the prefix is not found
                                    throw new ExpressionEvaluationException("Name does not contain the expected prefix 'dpt:ccs:app:hokies:'.");
                                }
                            </code>
                        </script>
                    </expression>
                </outbound>
            </attribute>
            <attribute>
                <ref>ri:description</ref>
                <displayName>Description</displayName>
                <outbound>
                    <source>
                        <path>$focus/name</path>
                    </source>
                    <expression>
                        <script>
                            <code>
                                // Use the name from the source
                                String name = basic.stringify(name);

                                // Return a description with the name
                                return "midPoint/Grouper created Group - " + name;
                            </code>
                        </script>
                    </expression>
                </outbound>
            </attribute>
            <attribute>
                <ref>ri:sAMAccountName</ref>
                <displayName>Login name</displayName>
                <outbound>
                    <strength>strong</strength>
                    <source>
                        <path>$focus/identifier</path>
                    </source>
                </outbound>
                <inbound>
                    <strength>weak</strength>
                    <target>
                        <path>identifier</path>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:displayNamePrintable</ref>
                <outbound>
                    <strength>strong</strength>
                    <source>
                        <path>displayName</path>
                    </source>
                </outbound>
            </attribute>
            <correlation>
                <correlators>
                    <items>
                        <enabled>true</enabled>
                        <item>
                            <ref>c:identifier</ref>
                        </item>
                    </items>
                </correlators>
            </correlation>
            <synchronization>
                <reaction>
                    <situation>linked</situation>
                    <actions>
                        <synchronize/>
                    </actions>
                </reaction>
                <reaction>
                    <situation>unlinked</situation>
                    <actions>
                        <link/>
                    </actions>
                </reaction>
                <reaction>
                    <situation>unmatched</situation>
                </reaction>
                <reaction>
                    <situation>deleted</situation>
                    <actions>
                        <unlink/>
                    </actions>
                </reaction>
            </synchronization>
        </objectType>
        <objectType>
            <kind>account</kind>
            <displayName>Default AD LDAP Account</displayName>
            <default>true</default>
            <delineation>
                <objectClass>ri:user</objectClass>
                <searchHierarchyScope>sub</searchHierarchyScope>
                <baseContext>
                    <objectClass>ri:user</objectClass>
                    <filter>
                        <q:text>attributes/dn = "AD_BASE_DN_OUTBOUND"</q:text>
                    </filter>
                </baseContext>
            </delineation>
            <focus>
                <type>c:UserType</type>
            </focus>
            <attribute>
                <ref>ri:sAMAccountName</ref>
                <displayName>Login name</displayName>
                <outbound>
                    <strength>weak</strength>
                    <source>
                        <path>$user/extension/authId</path>
                    </source>
                    <expression>
                        <script>
                            <code>
                                return authId
                            </code>
                        </script>
                    </expression>
                </outbound>
                <inbound>
                    <strength>weak</strength>
                    <target>
                        <path>extension/authId</path>
                    </target>
                </inbound>
                <inbound>
                    <strength>strong</strength>
                    <expression>
                        <assignmentTargetSearch>
                            <targetType>c:RoleType</targetType>
                            <oid>646f0332-7b53-4705-b8ef-26310910dcdf</oid>
                            <assignmentProperties>
                                <subtype>ad-person</subtype>
                            </assignmentProperties>
                        </assignmentTargetSearch>
                    </expression>
                    <target>
                        <path>assignment</path>
                        <set>
                            <condition>
                                <script>
                                    <code>
                                        return assignment?.subtype?.contains('ad-person')
                                    </code>
                                </script>
                            </condition>
                        </set>
                    </target>
                </inbound>
            </attribute>
            <attribute>
                <ref>ri:cn</ref>
                <outbound>
                    <strength>weak</strength>
                    <source>
                        <path>$focus/extension/authId</path>
                    </source>
                </outbound>
            </attribute>
            <attribute>
                <ref>ri:memberOf</ref>
                <fetchStrategy>explicit</fetchStrategy>
            </attribute>
            <association>
                <ref>ri:group</ref>
                <displayName>AD Group Membership</displayName>
                <kind>entitlement</kind>
                <intent>group</intent>
                <direction>objectToSubject</direction>
                <associationAttribute>ri:member</associationAttribute>
                <valueAttribute>ri:dn</valueAttribute>
                <shortcutAssociationAttribute>ri:memberOf</shortcutAssociationAttribute>
                <shortcutValueAttribute>ri:dn</shortcutValueAttribute>
                <explicitReferentialIntegrity>false</explicitReferentialIntegrity>
            </association>
            <correlation>
                <correlators>
                    <items>
                        <enabled>true</enabled>
                        <item>
                            <ref>extension/authId</ref>
                        </item>
                    </items>
                </correlators>
            </correlation>
            <synchronization>
                <reaction>
                    <situation>linked</situation>
                    <actions>
                        <synchronize/>
                    </actions>
                </reaction>
                <reaction>
                    <situation>unlinked</situation>
                    <actions>
                        <link/>
                    </actions>
                </reaction>
                <reaction>
                    <situation>unmatched</situation>
                </reaction>
                <reaction>
                    <situation>deleted</situation>
                    <actions>
                        <unlink/>
                    </actions>
                </reaction>
            </synchronization>
        </objectType>
    </schemaHandling>
    <capabilities/>
    <consistency>
        <avoidDuplicateValues>true</avoidDuplicateValues>
    </consistency>
</resource>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/resources/100-outbound-grouper-requests-scripted-sql.xml

```typescript
<resource xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
          xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
          xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
          xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
          xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
          xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          oid="31cef34a-8142-4c5a-bdc7-c769c7cfbba9"
          version="1">
    <name>Outbound Role Requests to Grouper</name>
    <description>Sends Requests from midPoint to Grouper for entry into various groups. [MP_GR_GROUP_REQUESTS table]</description>
    <connectorRef relation="org:default" type="c:ConnectorType">
        <description>
            Use Scripted SQL Connector
        </description>
        <filter>
            <q:equal>
                <q:path>connectorType</q:path>
                <q:value>com.evolveum.polygon.connector.scripted.sql.ScriptedSQLConnector</q:value>
            </q:equal>
        </filter>
    </connectorRef>
    <connectorConfiguration xmlns:icfc="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/connector-schema-3">
        <icfc:configurationProperties xmlns:sql="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/bundle/com.evolveum.polygon.connector-scripted-sql/com.evolveum.polygon.connector.scripted.sql.ScriptedSQLConnector">
            <sql:scriptRoots>/opt/midpoint/var/sql-scripts/mp-to-grouper</sql:scriptRoots>
            <sql:classpath>/opt/midpoint/var/sql-scripts/mp-to-grouper</sql:classpath>
            <sql:scriptBaseClass>BaseScript</sql:scriptBaseClass>
            <sql:searchScriptFileName>SearchScript.groovy</sql:searchScriptFileName>
            <sql:createScriptFileName>CreateUpdateScript.groovy</sql:createScriptFileName>
            <sql:updateScriptFileName>CreateUpdateScript.groovy</sql:updateScriptFileName>
            <sql:deleteScriptFileName>DeleteScript.groovy</sql:deleteScriptFileName>
            <sql:schemaScriptFileName>SchemaScript.groovy</sql:schemaScriptFileName>
            <sql:testScriptFileName>TestScript.groovy</sql:testScriptFileName>
            <sql:syncScriptFileName>SyncScript.groovy</sql:syncScriptFileName>
            <sql:user>INTERMEDIATE_DB_USER</sql:user>
            <sql:password>INTERMEDIATE_DB_PASSWORD</sql:password>
            <sql:jdbcDriver>org.postgresql.Driver</sql:jdbcDriver>
            <sql:jdbcUrlTemplate>jdbc:postgresql://GROUPER_DB_HOST:5432/grouper?currentSchema=mp_to_gr</sql:jdbcUrlTemplate>
            <sql:recompileGroovySource>false</sql:recompileGroovySource>
        </icfc:configurationProperties>
        <icfc:resultsHandlerConfiguration>
            <icfc:enableNormalizingResultsHandler>false</icfc:enableNormalizingResultsHandler>
            <icfc:enableFilteredResultsHandler>false</icfc:enableFilteredResultsHandler>
            <icfc:enableAttributesToGetSearchResultsHandler>false</icfc:enableAttributesToGetSearchResultsHandler>
        </icfc:resultsHandlerConfiguration>
        <icfc:timeouts>
            <icfc:create>180000</icfc:create>
            <icfc:get>180000</icfc:get>
            <icfc:update>180000</icfc:update>
            <icfc:delete>180000</icfc:delete>
            <icfc:test>60000</icfc:test>
            <icfc:scriptOnConnector>180000</icfc:scriptOnConnector>
            <icfc:scriptOnResource>180000</icfc:scriptOnResource>
            <icfc:authentication>60000</icfc:authentication>
            <icfc:search>180000</icfc:search>
            <icfc:validate>180000</icfc:validate>
            <icfc:sync>180000</icfc:sync>
            <icfc:schema>60000</icfc:schema>
        </icfc:timeouts>
    </connectorConfiguration>
    <schema></schema>
    <projection>
        <assignmentPolicyEnforcement>full</assignmentPolicyEnforcement>
        <legalize>true</legalize>
    </projection>
    <schemaHandling>
        <objectType>
            <displayName>Person Group Request Membership</displayName>
            <kind>account</kind>
            <intent>default</intent>
            <default>true</default>
            <delineation>
                <objectClass>ri:AccountObjectClass</objectClass>
            </delineation>
            <focus>
                <type>c:UserType</type>
            </focus>
            <attribute>
                <ref>icfs:name</ref>
                <tolerant>true</tolerant>
                <exclusiveStrong>false</exclusiveStrong>
                <correlator/>
                <outbound>
                    <authoritative>true</authoritative>
                    <exclusive>false</exclusive>
                    <strength>strong</strength>
                    <source>
                        <path>extension/uidNumber</path>
                    </source>
                </outbound>
                <inbound>
                    <authoritative>true</authoritative>
                    <exclusive>false</exclusive>
                    <strength>weak</strength>
                    <target>
                        <path>extension/uidNumber</path>
                    </target>
                </inbound>
            </attribute>
            <synchronization>
                <reaction>
                    <situation>linked</situation>
                    <actions>
                        <synchronize />
                    </actions>
                </reaction>
                <reaction>
                    <situation>unlinked</situation>
                    <actions>
                        <link />
                    </actions>
                </reaction>
                <reaction>
                    <situation>unmatched</situation>
                </reaction>
                <reaction>
                    <situation>deleted</situation>
                    <actions>
                        <unlink />
                    </actions>
                </reaction>
            </synchronization>
        </objectType>
    </schemaHandling>
</resource>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/roles/200-ad-user-role.xml

```typescript
<role xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      oid="646f0332-7b53-4705-b8ef-26310910dcdf">
    <name>AD Account</name>
    <description>This role is given if you have an existing AD Account (so MidPoint can delete membership of a user in a group/role, and NOT delete member from AD)</description>
    <activation/>
    <displayName>AD Account</displayName>
    <inducement>
        <construction>
            <resourceRef oid="728904ad-59ed-4473-bfac-dc6aebd26d6e" relation="org:default" type="c:ResourceType"/>
            <kind>account</kind>
            <intent>default</intent>
        </construction>
    </inducement>
    <requestable>false</requestable>
</role>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/roles/200-grouper-group-metarole.xml

```typescript
<role xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:apti="http://midpoint.evolveum.com/xml/ns/public/common/api-types-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
      xmlns:extnsn="http://internal.unicon.local/xml/ns/midpoint/schema/extension-3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      oid="bcaec940-50c8-44bb-aa37-b2b5bb2d5b90">
    <name>Grouper Provided Group MetaRole</name>
    <description>A metarole for archetyped Grouper-provided groups to map: org (grouper group) -> role relationships in midPoint.</description>
    <requestable>false</requestable>
    <riskLevel>1</riskLevel>

    <!-- Requester Example. Note this can be slow, if it is, you can add the Role manually and make the inducement there. Remember the name links to Group path/name --> -->
    <inducement>
        <targetRef oid="a66cfb07-0455-44d8-8547-368fe2fb283a" type="c:RoleType" relation="org:default"/>
        <condition>
            <expression>
                <runAsRef oid="00000000-0000-0000-0000-000000000002" xsi:type="c:ObjectReferenceType"/>
                <script>
                    <code>
                        import com.evolveum.midpoint.xml.ns._public.common.common_3.*

                        def targetOid = focusAssignment?.getTargetRef()?.getOid()

                        def query = midpoint.getPrismContext().queryFor(AbstractRoleType.class)
                                .item(AbstractRoleType.F_NAME)
                                .eq("dpt:sis:app:midpoint:midpoint-vt-employee-login")
                                .build()
                        def role = midpoint.searchObjects(RoleType.class, query)

                        if (!role?.isEmpty()) {
                            log.trace("Group MetaRole Comparing: " + targetOid + " with " + role[0].getOid() + ".")
                            return (targetOid == role[0].getOid())
                        }
                    </code>
                </script>
            </expression>
        </condition>
        <focusType>UserType</focusType>
        <orderConstraint>
            <orderMin>1</orderMin>
            <orderMax>unbounded</orderMax>
        </orderConstraint>
    </inducement>

    <!-- Approver Example. Note this can be slow, if it is, then you have to add the Role manually and make the inducement there. Remember the name links to Group Group path/name -->
    <!-- inducement>
        <targetRef oid="496a0703-affb-421f-9285-c7d3cb12f55e" type="c:ArchetypeType" relation="org:approver"/>
        <condition>
            <expression>
                <runAsRef oid="00000000-0000-0000-0000-000000000002" xsi:type="c:ObjectReferenceType"/>
                <script>
                    <code>
                        import com.evolveum.midpoint.xml.ns._public.common.common_3.*

                        def targetOid = focusAssignment?.getTargetRef()?.getOid()

                        def query = midpoint.getPrismContext().queryFor(AbstractRoleType.class)
                                .item(AbstractRoleType.F_NAME)
                                .eq("dpt:lisadev:app:midPoint-Request-App:requestInfo:approvers")
                                .build()
                        def role = midpoint.searchObjects(RoleType.class, query)

                        if (!role?.isEmpty()) {
                            log.trace("Group MetaRole Comparing: " + targetOid + " with " + role[0].getOid() + ".")
                            return (targetOid == role[0].getOid())
                        }
                    </code>
                </script>
            </expression>
        </condition>
        <focusType>UserType</focusType>
        <orderConstraint>
            <orderMin>1</orderMin>
            <orderMax>unbounded</orderMax>
        </orderConstraint>
    </inducement -->
</role>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/roles/200-gui-grouper-group-requester-role.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<role oid="a66cfb07-0455-44d8-8547-368fe2fb283a"
      xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:extnsn="http://internal.unicon.local/xml/ns/midpoint/schema/extension-3">
    <name>VT Role Requester</name>
    <description>Role authorizing end users to log in, and request only authorized/requestable roles sent to Grouper.</description>
    <requestable>false</requestable>
    <riskLevel>1</riskLevel>
    <authorization>
        <name>gui-self-service-access</name>
        <description>
            Allow access to all self-service operations in GUI.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#selfDashboard</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#selfProfile</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#selfRequestAssignments</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#assignmentDetails</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#postAuthentication</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#myRequests</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#case</action>
    </authorization>
    <authorization>
        <name>self-read</name>
        <description>
            Allow to read all the properties of "self" object. I.e. every logged-in user can read
            object that represent his own identity.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <special>self</special>
        </object>
    </authorization>
    <authorization>
        <name>self-shadow-read</name>
        <description>
            Allow to read all the properties of all the shadows that belong to "self" object.
            I.e. every logged-in user can read all his accounts.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>ShadowType</type>
            <owner>
                <special>self</special>
            </owner>
        </object>
    </authorization>
    <authorization>
        <name>self-persona-read</name>
        <description>
            Allow to read all the personas of currently logged-in user.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>UserType</type>
            <owner>
                <special>self</special>
            </owner>
        </object>
    </authorization>
    <authorization>
        <name>self-cases-read</name>
        <description>
            Allow to read all the cases of currently logged-in user.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>CaseType</type>
            <owner>
                <special>self</special>
            </owner>
        </object>
    </authorization>
    <authorization>
        <name>read-requestable-roles</name>
        <description>
            Allow to read requestable roles. This allows to search for requestable roles in user interface.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>RoleType</type>
            <filter>
                <q:and>
                    <q:equal>
                        <q:path>requestable</q:path>
                        <q:value>true</q:value>
                    </q:equal>
                    <q:equal>
                        <q:path>costCenter</q:path>
                        <q:value>mp_to_grouper_request_role</q:value>
                    </q:equal>
                </q:and>
            </filter>
        </object>
        <!-- Note: for production use you should consider limiting the items that can be read. -->
    </authorization>
    <authorization>
        <name>requestable-role-details</name>
        <description>
            Allow to show details of requestable roles in the user interface.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#roleDetails</action>
    </authorization>
    <authorization>
        <name>assign-requestable-roles</name>
        <description>
            Allow to assign requestable roles. This allows to request roles in a request-and-approve process.
            The requestable roles will be displayed in the role request dialog by default.
            Please note that the roles also need an approval definition to go through the approval process.
            Otherwise they will be assigned automatically without any approval.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#assign</action>
        <phase>request</phase>
        <object>
            <special>self</special>
        </object>
        <target>
            <type>RoleType</type>
            <filter>
                <q:and>
                    <q:equal>
                        <q:path>requestable</q:path>
                        <q:value>true</q:value>
                    </q:equal>
                    <q:equal>
                        <q:path>costCenter</q:path>
                        <q:value>mp_to_grouper_request_role</q:value>
                    </q:equal>
                </q:and>
            </filter>
        </target>
        <relation>org:default</relation>        <!-- only assignments with the default (member) relation can be requested -->
    </authorization>
    <authorization>
        <name>self-execution-modify</name>
        <description>
            Authorization that allows to self-modification of some properties, but only in execution phase.
            The limitation real limitation of these operations is done in the request phase.
            E.g. the modification of assignments is controlled in the request phase by using the #assign
            authorization.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#modify</action>
        <phase>execution</phase>
        <object>
            <special>self</special>
        </object>
        <item>credentials</item>
        <item>assignment</item>
    </authorization>
    <authorization>
        <name>self-shadow-execution-add-modify-delete</name>
        <description>
            Authorization that allows to self-modification of user's accounts, but only in execution phase.
            The real limitation of these operations is done in the request phase.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#add</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#modify</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#delete</action>
        <phase>execution</phase>
        <object>
            <type>ShadowType</type>
            <owner>
                <special>self</special>
            </owner>
        </object>
    </authorization>
    <authorization>
        <name>assignment-target-get</name>
        <description>
            Authorization that allows to read all the object that are possible assignment targets. We want that
            to display the targets in the selection windows.
            Note that this authorization may be too broad for production use. Normally it should be limited to just
            selected properties such as name and description.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#get</action>
        <object>
            <type>OrgType</type>
        </object>
        <object>
            <type>ResourceType</type>
        </object>
        <object>
            <type>RoleType</type>
        </object>
        <object>
            <type>ServiceType</type>
        </object>
        <object> <!-- Deputy delegations may have users as targets -->
            <type>UserType</type>
        </object>
        <!-- Note: for production use you should consider limiting the items that can be read. -->
    </authorization>
    <authorization>
        <name>operational-objects-get</name>
        <description>
            Authorization that allows to read all the object that are possible to use for (not only) GUI
            customizations. E.g there might be lookup tables used for attributes, custom form types defined, etc.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#get</action>
        <object>
            <type>LookupTableType</type>
        </object>
        <!-- Note: for production use you should consider limiting the items that can be read. -->
    </authorization>
    <authorization>
        <name>assignment-target-read-case</name>
        <description>
            Authorization that allows to read approval status of cases. This is used to display requests
            to the end users, especially in the "My Requests" box in user dashboard.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#cancelCase</action>
        <object>
            <type>CaseType</type>
            <requester>
                <special>self</special>
            </requester>
        </object>
    </authorization>
    <authorization>
        <name>self-owned-task-read</name>
        <description>
            Authorization that allows to see all tasks owned by a currently logged-in user.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>TaskType</type>
            <owner>
                <special>self</special>
            </owner>
        </object>
    </authorization>
    <adminGuiConfiguration>
        <homePage>
            <type>UserType</type>
            <widget>
                <identifier>myWorkItems</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>myAccounts</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>listUsersWidget</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>listResourcesWidget</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>credentialsWidget</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>myRequests</identifier>
                <action>
                    <identifier>viewAll</identifier>
                    <visibility>hidden</visibility>
                    <target>
                        <targetUrl>/admin/casesAll</targetUrl>
                        <collectionIdentifier>my-cases</collectionIdentifier>
                    </target>
                </action>
            </widget>
            <widget>
                <identifier>myHistory</identifier>
                <visibility>hidden</visibility>
            </widget>
        </homePage>
        <selfProfilePage>
            <type>UserType</type>
            <panel>
                <identifier>history</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>projections</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>assignments</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>activation</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>password</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>personas</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>userDelegations</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>delegatedToMe</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>focusTriggers</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>focusCases</identifier>
                <visibility>hidden</visibility>
            </panel>
        </selfProfilePage>
        <accessRequest>
            <targetSelection>
                <defaultSelection>myself</defaultSelection>
                <allowRequestForMyself>true</allowRequestForMyself>
                <allowRequestForOthers>false</allowRequestForOthers>
            </targetSelection>
            <relationSelection>
                <defaultRelation>org:default</defaultRelation>
                <allowOtherRelations>false</allowOtherRelations>
            </relationSelection>
            <roleCatalog>
                <showRolesOfTeammate>false</showRolesOfTeammate>
                <collection>
                    <identifier>allRoles</identifier>
                    <default>true</default>
                    <collectionIdentifier>allRoles</collectionIdentifier>
                </collection>
            </roleCatalog>
        </accessRequest>
    </adminGuiConfiguration>
</role>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/roles/200-gui-role-approver.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<role oid="5a94f694-5419-42fb-9305-30e90a14b7f9"
      xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:extnsn="http://internal.unicon.local/xml/ns/midpoint/schema/extension-3">
    <name>VT Role Approver</name>
    <description>Role authorizing users to make approval decisions on work items.</description>
    <authorization>
        <name>gui-approver-access</name>
        <description>
            Allow access to list of work items in GUI. Allow access to pages that show object details,
            so the approver may examine who is requesting and what is requesting.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#workItem</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#myRequests</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#myWorkItems</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#claimableWorkItems</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#userDetails</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#roleDetails</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#selfDashboard</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#selfProfile</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#assignmentDetails</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-ui-3#postAuthentication</action>
    </authorization>
    <authorization>
        <name>own-workitems-read-complete-delegate</name>
        <description>
            Allows reading, completion, and delegation of own work items.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#completeWorkItem</action>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#delegateWorkItem</action>
        <object>
            <parent>
                <type>CaseType</type>
                <path>workItem</path>
            </parent>
            <assignee>
                <special>self</special>
            </assignee>
        </object>
    </authorization>
    <authorization>
        <name>cases-read</name>
        <description>
            Allow to see the requester of the operation that is being approved and the current delta.
            In order for the approver to see other properties (e.g. history of the approvals) please allow read access
            to other items as well.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>CaseType</type>
        </object>
        <item>name</item>
        <item>archetypeRef</item>
        <item>metadata</item>
        <item>parentRef</item>
        <item>requestorRef</item>
        <item>objectRef</item>
        <item>targetRef</item>
        <item>state</item>
        <item>stageNumber</item>
        <item>approvalContext</item>
        <item>modelContext</item>
    </authorization>
    <authorization>
        <name>users-read</name>
        <description>
            Allow to read basic user properties to be able to display requestor details in the
            approval forms.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>UserType</type>
        </object>
        <item>name</item>
        <item>givenName</item>
        <item>familyName</item>
        <item>fullName</item>
        <item>employeeType</item>
        <item>employeeNumber</item>
    </authorization>
    <authorization>
        <name>roles-read</name>
        <description>
            Allow to read basic role properties to be able to display details of the requested role.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>RoleType</type>
        </object>
        <item>name</item>
        <item>displayName</item>
        <item>identifier</item>
        <item>description</item>
        <item>riskLevel</item>
        <item>roleType</item>
    </authorization>
    <authorization>
        <name>orgs-read</name>
        <description>
            Allow to read basic org properties to be able to display details of the requested org.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>OrgType</type>
        </object>
        <item>name</item>
        <item>displayName</item>
        <item>identifier</item>
        <item>description</item>
        <item>riskLevel</item>
        <item>orgType</item>
    </authorization>
    <authorization>
        <name>services-read</name>
        <description>
            Allow to read basic service properties to be able to display details of the requested service.
        </description>
        <action>http://midpoint.evolveum.com/xml/ns/public/security/authorization-model-3#read</action>
        <object>
            <type>ServiceType</type>
        </object>
        <item>name</item>
        <item>displayName</item>
        <item>identifier</item>
        <item>description</item>
        <item>riskLevel</item>
        <item>serviceType</item>
    </authorization>
    <adminGuiConfiguration>
        <homePage>
            <type>UserType</type>
            <widget>
                <identifier>myWorkItems</identifier>
                <visibility>visible</visibility>
            </widget>
            <widget>
                <identifier>myAccounts</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>listUsersWidget</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>listResourcesWidget</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>credentialsWidget</identifier>
                <visibility>hidden</visibility>
            </widget>
            <widget>
                <identifier>myRequests</identifier>
                <action>
                    <identifier>viewAll</identifier>
                    <visibility>hidden</visibility>
                    <target>
                        <targetUrl>/admin/casesAll</targetUrl>
                        <collectionIdentifier>my-cases</collectionIdentifier>
                    </target>
                </action>
            </widget>
             <widget>
                <identifier>myAccesses</identifier>
                <visibility>hidden</visibility>
            </widget>
        </homePage>
        <selfProfilePage>
            <type>UserType</type>
            <panel>
                <identifier>history</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>projections</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>assignments</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>activation</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>password</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>personas</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>userDelegations</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>delegatedToMe</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>focusTriggers</identifier>
                <visibility>hidden</visibility>
            </panel>
            <panel>
                <identifier>focusCases</identifier>
                <visibility>hidden</visibility>
            </panel>
        </selfProfilePage>
    </adminGuiConfiguration>
</role>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/security-policy/009-global-password-policy.xml

```typescript
<valuePolicy oid="a1a4df33-6836-41cd-859f-5c13af71ec0a" xsi:type="ValuePolicyType" version="0"
             xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <name>Global Password Policy</name>
    <description>Global password policy that requires 24-32 character mixed-case alphanumeric passwords.</description>
    <stringPolicy>
        <description>String validation policy</description>
        <limitations>
            <minLength>24</minLength>
            <maxLength>32</maxLength>
            <minUniqueChars>8</minUniqueChars>
            <checkPattern />
            <limit>
                <description>Lowercase alphanumeric characters</description>
                <minOccurs>1</minOccurs>
                <mustBeFirst>false</mustBeFirst>
                <characterClass>
                    <value>abcdefghijklmnopqrstuvwxyz</value>
                </characterClass>
            </limit>
            <limit>
                <description>Uppercase alphanumeric characters</description>
                <minOccurs>1</minOccurs>
                <mustBeFirst>false</mustBeFirst>
                <characterClass>
                    <value>ABCDEFGHIJKLMNOPQRSTUVWXYZ</value>
                </characterClass>
            </limit>
            <limit>
                <description>Numeric characters</description>
                <minOccurs>1</minOccurs>
                <mustBeFirst>false</mustBeFirst>
                <characterClass>
                    <value>1234567890</value>
                </characterClass>
            </limit>
        </limitations>
    </stringPolicy>
</valuePolicy>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/security-policy/010-security-policy.xml

```typescript
<securityPolicy xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
                xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
                xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
                xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
                xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" oid="c40b9d9c-267d-41a5-964f-60bc69b23a91" version="1">
    <name>VT Default Security Policy</name>
    <authentication>
        <modules>
            <oidc>
                <identifier>oidcsso</identifier>
                <!-- OIDC_ literals are property placeholders that are replaced by setenv.sh -->
                <client>
                    <registrationId>gw</registrationId>
                    <clientId>OIDC_CLIENT_ID</clientId>
                    <clientSecret>
                        <clearValue>OIDC_CLIENT_SECRET</clearValue>
                    </clientSecret>
                    <clientAuthenticationMethod>clientSecretBasic</clientAuthenticationMethod>
                    <scope>openid</scope>
                    <scope>uupid</scope>
                    <nameOfUsernameAttribute>uupid</nameOfUsernameAttribute>
                    <openIdProvider>
                        <issuerUri>OIDC_ISSUER</issuerUri>
                    </openIdProvider>
                </client>
            </oidc>
            <loginForm>
                <identifier>internalLoginForm</identifier>
                <description>Internal username/password authentication, default user password, login form</description>
            </loginForm>
            <httpBasic>
                <identifier>internalBasic</identifier>
                <description>Internal username/password authentication, using HTTP basic auth</description>
            </httpBasic>
            <mailNonce>
                <identifier>registrationMail</identifier>
                <description>Authentication based on mail message with a nonce. Used for user registration.</description>
                <credentialName>mailNonce</credentialName>
            </mailNonce>
            <smsNonce>
                <identifier>passwordResetSms</identifier>
                <description>Authentication based on SMS message with a nonce. Used for password resets.</description>
                <credentialName>smsNonce</credentialName>
                <mobileTelephoneNumberItemPath>extension/mobile</mobileTelephoneNumberItemPath>
            </smsNonce>
            <securityQuestionsForm>
                <identifier>SecQ</identifier>
                <description>
                    This is interactive, form-based authentication by using security questions.
                </description>
            </securityQuestionsForm>
            <httpSecQ>
                <identifier>httpSecQ</identifier>
                <description>
                    Special "HTTP SecQ" authentication based on security question answers.
                    It is used for REST service.
                </description>
            </httpSecQ>
        </modules>
        <sequence>
            <identifier>admin-gui-default</identifier>
            <channel>
                <channelId>http://midpoint.evolveum.com/xml/ns/public/common/channels-3#user</channelId>
                <default>true</default>
                <urlSuffix>default</urlSuffix>
            </channel>
            <module>
                <identifier>oidcsso</identifier>
                <order>10</order>
                <necessity>sufficient</necessity>
            </module>
        </sequence>
        <sequence>
            <identifier>admin-gui-emergency</identifier>
            <description>
                Special GUI authentication sequence that is using just the internal user password.
                It is used only in emergency. It allows to skip SAML authentication cycles, e.g. in case
                that the SAML authentication is redirecting the browser incorrectly.
            </description>
            <channel>
                <channelId>http://midpoint.evolveum.com/xml/ns/public/common/channels-3#user</channelId>
                <default>false</default>
                <urlSuffix>emergency</urlSuffix>
            </channel>
            <requireAssignmentTarget oid="00000000-0000-0000-0000-000000000004" relation="org:default" type="RoleType">
                <!-- Superuser -->
            </requireAssignmentTarget>
            <module>
                <identifier>internalLoginForm</identifier>
                <order>30</order>
                <necessity>sufficient</necessity>
            </module>
        </sequence>
        <sequence>
            <identifier>rest</identifier>
            <description>
                Authentication sequence for REST service.
            </description>
            <channel>
                <channelId>http://midpoint.evolveum.com/xml/ns/public/common/channels-3#rest</channelId>
                <default>true</default>
                <urlSuffix>rest-default</urlSuffix>
            </channel>
            <module>
                <identifier>internalBasic</identifier>
                <order>10</order>
                <necessity>sufficient</necessity>
            </module>
        </sequence>
        <sequence>
            <identifier>actuator</identifier>
            <description>
                Authentication sequence for actuator.
            </description>
            <channel>
                <channelId>http://midpoint.evolveum.com/xml/ns/public/common/channels-3#actuator</channelId>
                <default>true</default>
                <urlSuffix>actuator-default</urlSuffix>
            </channel>
            <module>
                <identifier>internalBasic</identifier>
                <order>10</order>
                <necessity>sufficient</necessity>
            </module>
        </sequence>
        <ignoredLocalPath>/actuator/health</ignoredLocalPath>
        <ignoredLocalPath>/actuator</ignoredLocalPath>
    </authentication>
    <credentials>
        <password>
            <minOccurs>0</minOccurs>
            <lockoutMaxFailedAttempts>3</lockoutMaxFailedAttempts>
            <lockoutFailedAttemptsDuration>PT3M</lockoutFailedAttemptsDuration>
            <lockoutDuration>PT15M</lockoutDuration>
            <valuePolicyRef oid="a1a4df33-6836-41cd-859f-5c13af71ec0a" relation="org:default" type="ValuePolicyType">
                <!-- Global password policy defined in 009-global-password-policy.xml -->
            </valuePolicyRef>
        </password>
    </credentials>
</securityPolicy>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/system-configuration/000-system-configuration.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<systemConfiguration xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
                     xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
                     xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
                     xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
                     xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
                     xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
                     xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     oid="00000000-0000-0000-0000-000000000001"
                     version="0">
    <name>SystemConfiguration</name>
    <indestructible>true</indestructible>
    <iteration>0</iteration>
    <iterationToken/>
    <!-- TODO add URL here, may not be needed for OIDC SSO more testing should be done. -->
    <!-- infrastructure>
        <publicHttpUrlPattern>https://idm.vt.local/midpoint</publicHttpUrlPattern>
    </infrastructure -->
    <globalSecurityPolicyRef oid="c40b9d9c-267d-41a5-964f-60bc69b23a91" relation="org:default" type="c:SecurityPolicyType">
        <!-- Default Security Policy -->
    </globalSecurityPolicyRef>
    <defaultObjectPolicyConfiguration>
        <objectTemplateRef oid="50a11daf-bb7f-4a59-9d42-ce79f1721950" relation="org:default" type="c:ObjectTemplateType">
            <!-- Default User Object Template -->
        </objectTemplateRef>
        <type>c:UserType</type>
    </defaultObjectPolicyConfiguration>
    <defaultObjectPolicyConfiguration>
        <objectTemplateRef oid="8bf9c2c4-a458-457a-a36b-fe57e6c351c4" relation="org:default" type="c:ObjectTemplateType">
            <!-- Default Role Template -->
        </objectTemplateRef>
        <type>c:RoleType</type>
    </defaultObjectPolicyConfiguration>
    <!-- Uncomment below if you want to add a custom column to the audit records such as netId or userId. Will also need modifications to config.xml See: https://docs.evolveum.com/midpoint/reference/repository/generic/generic-audit/#custom-column -->
    <!-- audit>
        <eventRecording>
            <property>
                <name>netId</name>
                <expression>
                    <script>
                        <code>
                            def netid = basic.getExtensionPropertyValue(target,"netid")
                            return netid ? netid : ""
                        </code>
                    </script>
                </expression>
            </property>
        </eventRecording>
    </audit -->
    <deploymentInformation>
        <name>VT Local midPoint</name>
        <headerColor>#861f41</headerColor>
        <logo>
            <imageUrl>static-web/vt-logo-horiz-white-orange-maroonBG.svg</imageUrl>
        </logo>
    </deploymentInformation>
    <!-- Uncomment the below to use self-registration or password reset notifications, will also need configuration in securityPolicy -->
    <!-- notificationConfiguration>
        <handler>
            <userRegistrationNotifier>
                <recipientExpression>
                    <script xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="c:ScriptExpressionEvaluatorType">
                        <code>
                            return requestee.getEmailAddress()
                        </code>
                    </script>
                </recipientExpression>
                <bodyExpression>
                    <script>
                        <code>

                            import com.evolveum.midpoint.notifications.api.events.ModelEvent
                            modelEvent = (ModelEvent) event
                            newUser = modelEvent.getFocusContext().getObjectNew();
                            userType = newUser.asObjectable();

                            plainTextPassword = midpoint.getPlaintextUserPassword(userType);

                            bodyMessage = "Dear " + userType.getGivenName() + ",\n\n" +
                            "Your account was successfully created at this university! To activate your account, click on the confirmation link below." +
                            "\n" +
                            "After your account is activated, use following credentials to log in: \n" +
                            "username: " + userType.getName().getOrig() + "\n" +
                            "password: " + plainTextPassword+ "\n\n" +
                            midpoint.createRegistrationConfirmationLink(userType);

                            return bodyMessage;
                        </code>
                    </script>
                </bodyExpression>
                <transport>mail</transport>
                <confirmationMethod>link</confirmationMethod>
            </userRegistrationNotifier>
            <passwordResetNotifier>
                <recipientExpression>
                    <script xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="c:ScriptExpressionEvaluatorType">
                        <code>return requestee.getEmailAddress()</code>
                    </script>
                </recipientExpression>
                <bodyExpression>
                    <script xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="c:ScriptExpressionEvaluatorType">
                        <code>
                            import com.evolveum.midpoint.notifications.api.events.ModelEvent
                            modelEvent = (ModelEvent) event
                            newUser = modelEvent.getFocusContext().getObjectNew();
                            userType = newUser.asObjectable();
                            link = midpoint.createPasswordResetLink(userType).replaceAll('null','https://midpoint.unicon.local/midpoint');
                            bodyMessage = "Did you request password reset? If yes, click on the link below! \n" + link
                            return bodyMessage;
                        </code>
                    </script>
                </bodyExpression>
                <transport>mail</transport>
            </passwordResetNotifier>
        </handler>
        <mail>
            <server>
                <host>mail</host>
                <port>1025</port>
            </server>
            <defaultFrom>adminmail@example.edu</defaultFrom>
            <debug>true</debug>
        </mail>
    </notificationConfiguration -->
    <!-- midpoint 4.4 LTS -->
    <logging>
        <classLogger id="1">
            <!-- disabled because INFO log during of creating new authentication filter chain -->
            <level>OFF</level>
            <package>org.springframework.security.web.DefaultSecurityFilterChain</package>
        </classLogger>
        <classLogger id="2">
            <!-- disabled because of MID-744, helper insert messages on ERROR
            level which should not be there (probably should be on TRACE) -->
            <level>OFF</level>
            <package>org.hibernate.engine.jdbc.spi.SqlExceptionHelper</package>
        </classLogger>
        <!-- Disabled because we treat locking-related exceptions in the repository.
             Otherwise the log is filled-in with (innocent but ugly-looking) messages like
             "ERROR (o.h.engine.jdbc.batch.internal.BatchingBatch): HHH000315: Exception executing batch [Deadlock detected.
             The current transaction was rolled back." -->
        <classLogger id="3">
            <level>OFF</level>
            <package>org.hibernate.engine.jdbc.batch.internal.BatchingBatch</package>
        </classLogger>
        <!-- Disabled because of the same reason; this time concerning messages like
             "INFO (org.hibernate.engine.jdbc.batch.internal.AbstractBatchImpl):
             HHH000010: On release of batch it still contained JDBC statements" -->
        <classLogger id="4">
            <level>WARN</level>
            <package>org.hibernate.engine.jdbc.batch.internal.AbstractBatchImpl</package>
        </classLogger>
        <!-- Disabled because of MID-4636 -->
        <classLogger id="5">
            <level>OFF</level>
            <package>org.hibernate.internal.ExceptionMapperStandardImpl</package>
        </classLogger>
        <classLogger id="6">
            <!-- disabled because we don't need to see every property file
            loading message (unnecessary log pollution) -->
            <level>WARN</level>
            <package>org.apache.wicket.resource.PropertiesFactory</package>
        </classLogger>
        <classLogger id="7">
            <!-- disabled because we don't need to see every log message for every key
            when resource bundle doesn't exist for specific locale (unnecessary log pollution) -->
            <level>ERROR</level>
            <package>org.springframework.context.support.ResourceBundleMessageSource</package>
        </classLogger>
        <classLogger id="8">
            <!-- Standard useful logger -->
            <level>INFO</level>
            <package>com.evolveum.midpoint.model.impl.lens.projector.Projector</package>
        </classLogger>
        <classLogger id="9">
            <!-- Standard useful logger -->
            <level>INFO</level>
            <package>com.evolveum.midpoint.model.impl.lens.Clockwork</package>
        </classLogger>
        <classLogger>
            <level>WARN</level>
            <package>org.ldaptive</package>
        </classLogger>


        <appender id="10" xsi:type="c:FileAppenderConfigurationType"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <pattern>
                %date{yyyy-MM-dd'T'HH:mm:ss.SSSXX} %t %X{req.xForwardedFor:-null} %level [%logger:%line] %msg%n%ex{3}
            </pattern>
            <name>MIDPOINT_LOG</name>
            <fileName>${midpoint.logs}/splunk-${midpoint.host}.log</fileName>
            <filePattern>${midpoint.logs}/splunk-${midpoint.host}-%d{yyyy-MM-dd}-%i.log</filePattern>
            <!-- Disable history-based cleanup. -->
            <maxHistory>0</maxHistory>
            <!-- Avoid rolling files based on size -->
            <maxFileSize>10GB</maxFileSize>
            <append>true</append>
        </appender>
        <!-- Appender for profiling purposes -->
        <appender id="11" xsi:type="c:FileAppenderConfigurationType"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <pattern>%date{yyyy-MM-dd'T'HH:mm:ss.SSSXX} %t %level [%logger:%line] %msg%n</pattern>
            <name>MIDPOINT_PROFILE_LOG</name>
            <fileName>${midpoint.logs}/midpoint-profile-${midpoint.host}.log</fileName>
            <filePattern>${midpoint.logs}/midpoint-profile-${midpoint.host}-%d{yyyy-MM-dd}-%i.log</filePattern>
            <!-- Disable history-based cleanup. -->
            <maxHistory>0</maxHistory>
            <!-- Avoid rolling files based on size -->
            <maxFileSize>10GB</maxFileSize>
            <append>true</append>
        </appender>
        <rootLoggerAppender>MIDPOINT_LOG</rootLoggerAppender>
        <rootLoggerLevel>INFO</rootLoggerLevel>
        <auditing>
            <enabled>true</enabled>
            <details>false</details>
            <appender>MIDPOINT_LOG</appender>
        </auditing>
    </logging>
    <cleanupPolicy>
        <auditRecords>
            <maxAge>P3M</maxAge>
        </auditRecords>
        <closedTasks>
            <maxAge>P1M</maxAge>
        </closedTasks>
    </cleanupPolicy>
    <internals>
        <tracing>
            <profile id="12">
                <name>performance</name>
                <displayName>Performance tracing</displayName>
                <visible>true</visible>
                <default>true</default>
                <fileNamePattern>performance-trace %{timestamp} %{focusName} %{milliseconds}</fileNamePattern>
                <createRepoObject>true</createRepoObject>
                <compressOutput>true</compressOutput>
            </profile>
            <profile id="13">
                <name>functional</name>
                <displayName>Functional tracing</displayName>
                <visible>true</visible>
                <fileNamePattern>functional-trace %{timestamp} %{focusName}</fileNamePattern>
                <createRepoObject>true</createRepoObject>
                <compressOutput>true</compressOutput>
                <collectLogEntries>true</collectLogEntries>
                <tracingTypeProfile id="16">
                    <level>normal</level>
                </tracingTypeProfile>
            </profile>
            <profile id="14">
                <name>functional-model-logging</name>
                <displayName>Functional tracing (with model logging)</displayName>
                <visible>true</visible>
                <fileNamePattern>functional-trace %{timestamp} %{focusName}</fileNamePattern>
                <createRepoObject>true</createRepoObject>
                <compressOutput>true</compressOutput>
                <collectLogEntries>true</collectLogEntries>
                <loggingOverride>
                    <levelOverride id="17">
                        <logger>com.evolveum.midpoint.model</logger>
                        <level>TRACE</level>
                    </levelOverride>
                </loggingOverride>
                <tracingTypeProfile id="18">
                    <level>normal</level>
                </tracingTypeProfile>
            </profile>
            <profile id="15">
                <name>functional-sql-logging</name>
                <displayName>Functional tracing (with SQL logging)</displayName>
                <visible>true</visible>
                <fileNamePattern>functional-trace %{timestamp} %{focusName}</fileNamePattern>
                <createRepoObject>true</createRepoObject>
                <compressOutput>true</compressOutput>
                <collectLogEntries>true</collectLogEntries>
                <loggingOverride>
                    <levelOverride id="19">
                        <logger>org.hibernate.SQL</logger>
                        <level>TRACE</level>
                    </levelOverride>
                </loggingOverride>
                <tracingTypeProfile id="20">
                    <level>normal</level>
                </tracingTypeProfile>
            </profile>
        </tracing>
    </internals>
    <adminGuiConfiguration>
        <homePage id="21">
            <type>UserType</type>
            <widget id="22">
                <identifier>search</identifier>
            </widget>
            <widget id="23">
                <identifier>myAccesses</identifier>
                <display>
                    <label>
                        <orig>My accesses</orig>
                        <translation>
                            <key>PageSelfDashboard.myAccesses</key>
                        </translation>
                    </label>
                    <cssClass>col-12 col-xxl-6</cssClass>
                    <icon>
                        <cssClass>fe fe-assignment</cssClass>
                    </icon>
                </display>
                <displayOrder>10</displayOrder>
                <action id="31">
                    <identifier>viewAll</identifier>
                    <display>
                        <label>
                            <orig>View all</orig>
                            <translation>
                                <key>PageSelfDashboard.button.viewAll</key>
                            </translation>
                        </label>
                        <icon>
                            <cssClass>fa fa-search</cssClass>
                        </icon>
                    </display>
                    <target>
                        <targetUrl>/self/profile/user</targetUrl>
                        <panelIdentifier>allAssignments</panelIdentifier>
                    </target>
                </action>
                <action id="32">
                    <identifier>requestAccess</identifier>
                    <display>
                        <label>
                            <orig>Request access</orig>
                            <translation>
                                <key>PageRequestAccess.title</key>
                            </translation>
                        </label>
            <icon>
                            <cssClass>fas fa-plus-circle</cssClass>
            </icon>
                    </display>
                    <target>
                        <targetUrl>/self/requestAccess</targetUrl>
                    </target>
                </action>
                <panelType>allAssignments</panelType>
                <previewSize>5</previewSize>
            </widget>
            <widget id="24">
                <identifier>myRequests</identifier>
                <display>
                    <label>
                        <orig>My requests</orig>
                        <translation>
                            <key>PageSelfDashboard.myRequests</key>
                        </translation>
                    </label>
                    <cssClass>col-12 col-xxl-6</cssClass>
            <icon>
                        <cssClass>fe fe-case</cssClass>
                    </icon>
                </display>
                <displayOrder>20</displayOrder>
                <action id="33">
                    <identifier>viewAll</identifier>
                    <display>
                        <label>
                            <orig>View all</orig>
                            <translation>
                                <key>PageSelfDashboard.button.viewAll</key>
                            </translation>
                        </label>
                        <icon>
                            <cssClass>fa fa-search</cssClass>
                        </icon>
                    </display>
                    <target>
                        <targetUrl>/admin/casesAll</targetUrl>
                        <collectionIdentifier>my-cases</collectionIdentifier>
                    </target>
                </action>
                <panelType>myRequests</panelType>
                <previewSize>5</previewSize>
            </widget>
            <widget id="25">
                <identifier>myWorkItems</identifier>
                <display>
                    <label>
                        <orig>My work items</orig>
                        <translation>
                            <key>PageSelfDashboard.workItems</key>
                        </translation>
                    </label>
                    <cssClass>col-12 col-xxl-6</cssClass>
                    <icon>
                        <cssClass>fa fa-inbox</cssClass>
                    </icon>
                </display>
                <displayOrder>40</displayOrder>
                <action id="34">
                    <identifier>viewAll</identifier>
                    <display>
                        <label>
                            <orig>View all</orig>
                            <translation>
                                <key>PageSelfDashboard.button.viewAll</key>
                            </translation>
                        </label>
                        <icon>
                            <cssClass>fa fa-search</cssClass>
                        </icon>
                    </display>
                    <target>
                        <targetUrl>/admin/myWorkItems</targetUrl>
                    </target>
                </action>
                <panelType>myWorkItems</panelType>
                <previewSize>5</previewSize>
            </widget>
            <widget id="26">
                <identifier>myAccounts</identifier>
                <display>
                    <label>
                        <orig>My accounts</orig>
                        <translation>
                            <key>PageDashboard.accounts</key>
                        </translation>
                    </label>
                    <cssClass>col-12 col-xxl-6</cssClass>
                    <icon>
                        <cssClass>fa fa-male</cssClass>
                    </icon>
                </display>
                <displayOrder>30</displayOrder>
                <action id="35">
                    <identifier>viewAll</identifier>
                    <display>
                        <label>
                            <orig>View all</orig>
                            <translation>
                                <key>PageSelfDashboard.button.viewAll</key>
                            </translation>
                        </label>
                        <icon>
                            <cssClass>fa fa-search</cssClass>
                        </icon>
                    </display>
                    <target>
                        <targetUrl>/self/profile/user</targetUrl>
                        <panelIdentifier>projections</panelIdentifier>
                    </target>
                </action>
                <panelType>projections</panelType>
                <previewSize>5</previewSize>
            </widget>
            <widget id="27">
                <identifier>profileWidget</identifier>
                <display>
                    <label>
                        <orig>Profile</orig>
                        <translation>
                            <key>PageSelfDashboard.profile</key>
                        </translation>
                    </label>
                    <help>PageSelfDashboard.profile.description</help>
                    <cssClass>col-md-3</cssClass>
                    <icon>
                        <cssClass>bg-green fa fa-user</cssClass>
                    </icon>
                </display>
                <panelType>linkWidget</panelType>
                <action id="36">
                    <identifier>profile-widget-action</identifier>
                    <target>
                        <targetUrl>/self/profile/user</targetUrl>
                    </target>
                </action>
            </widget>
            <widget id="28">
                <identifier>credentialsWidget</identifier>
                <display>
                    <label>
                        <orig>Credentials</orig>
                        <translation>
                            <key>PageSelfDashboard.credentials</key>
                        </translation>
                    </label>
                    <help>PageSelfDashboard.credentials.description</help>
                    <cssClass>col-md-3</cssClass>
                    <icon>
                        <cssClass>bg-blue fa fa-shield-alt</cssClass>
            </icon>
                </display>
                <panelType>linkWidget</panelType>
                <action id="37">
                    <identifier>credentials-widget-action</identifier>
                    <target>
                        <targetUrl>/self/credentials</targetUrl>
                    </target>
                </action>
            </widget>
            <widget id="29">
                <identifier>listResourcesWidget</identifier>
                <display>
                    <label>
                        <orig>List resources</orig>
                        <translation>
                            <key>PageSelfDashboard.listResources</key>
                        </translation>
                    </label>
                    <cssClass>col-md-3</cssClass>
            <icon>
                        <cssClass>bg-purple fa fa-database</cssClass>
            </icon>
                </display>
                <panelType>linkWidget</panelType>
                <action id="38">
                    <identifier>list-resources-widget-action</identifier>
                    <target>
            <targetUrl>/admin/resources</targetUrl>
                    </target>
                </action>
            </widget>
            <widget id="30">
                <identifier>listUsersWidget</identifier>
                <display>
                    <label>
                        <orig>List users</orig>
                        <translation>
                            <key>PageSelfDashboard.listUsers</key>
                        </translation>
                    </label>
                    <cssClass>col-md-3</cssClass>
            <icon>
                        <cssClass>bg-red fa fa-user</cssClass>
            </icon>
                </display>
                <panelType>linkWidget</panelType>
                <action id="39">
                    <identifier>list-resources-widget-action</identifier>
                    <target>
                        <targetUrl>/admin/users</targetUrl>
                    </target>
                </action>
            </widget>
        </homePage>
        <objectCollectionViews>
            <objectCollectionView id="40">
                <identifier>my-cases</identifier>
                <display>
                    <label>My cases</label>
                    <!-- We need to explicitly specify plural label here. Otherwise it will be overwritten by a plural label from archetype. -->
                    <pluralLabel>
                        <orig>My cases</orig>
                        <translation>
                            <key>MyCases.title</key>
                        </translation>
                    </pluralLabel>
                    <singularLabel>My case</singularLabel>
                    <icon>
                        <cssClass>fe fe-case-object</cssClass>
                    </icon>
                </display>
                <displayOrder>1000</displayOrder>
                <type>CaseType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000344" relation="org:default" type="c:ObjectCollectionType">
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="41">
                <identifier>manual-case-view</identifier>
                <display>
                    <label>Manual cases</label> <!-- "Manual provisioning cases" is too long for the menu -->
                    <!-- We need to explicitly specify plural label here. Otherwise it will be overwritten by a plural label from archetype. -->
                    <pluralLabel>
                        <orig>All manual cases</orig>
                        <translation>
                            <key>AllManualCases.title</key>
                        </translation>
                    </pluralLabel>
                    <singularLabel>Manual case</singularLabel>
                    <tooltip>Manual provisioning cases</tooltip>
                </display>
                <displayOrder>1010</displayOrder>
                <type>CaseType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000340" relation="org:default" type="c:ArchetypeType">
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="42">
                <identifier>operation-request-case-view</identifier>
                <display>
                    <label>Requests</label> <!-- "Operation requests" is too long for the menu -->
                    <!-- We need to explicitly specify plural label here. Otherwise it will be overwritten by a plural label from archetype. -->
                    <pluralLabel>
                        <orig>All requests</orig>
                        <translation>
                            <key>AllRequests.title</key>
                        </translation>
                    </pluralLabel>
                    <singularLabel>Request</singularLabel>
                    <tooltip>Operation requests</tooltip>
                </display>
                <displayOrder>1020</displayOrder>
                <type>CaseType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000341" relation="org:default" type="c:ArchetypeType">
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="43">
                <identifier>approval-case-view</identifier>
                <display>
                    <label>Approvals</label> <!-- "Approval cases" is too long for the menu -->
                    <!-- We need to explicitly specify plural label here. Otherwise it will be overwritten by a plural label from archetype. -->
                    <pluralLabel>
                        <orig>All approvals</orig>
                        <translation>
                            <key>AllApprovals.title</key>
                        </translation>
                    </pluralLabel>
                    <singularLabel>Approval</singularLabel>
                    <tooltip>Approval cases</tooltip>
                </display>
                <displayOrder>1030</displayOrder>
                <type>CaseType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000342" relation="org:default" type="c:ArchetypeType">
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="44">
                <identifier>correlation-case-view</identifier>
                <display>
                    <label>Correlations</label> <!-- "Correlation cases" is too long for the menu -->
                    <!-- We need to explicitly specify plural label here. Otherwise it will be overwritten by a plural label from archetype. -->
                    <pluralLabel>
                        <orig>All correlations</orig>
                        <translation>
                            <key>AllCorrelations.title</key>
                        </translation>
                    </pluralLabel>
                    <singularLabel>Correlation</singularLabel>
                    <tooltip>Correlation cases</tooltip>
                </display>
                <displayOrder>1040</displayOrder>
                <type>CaseType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000345" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="45">
                <identifier>reconciliation-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="46">
                <identifier>recomputation-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000502" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="47">
                <identifier>import-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000503" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="48">
                <identifier>live-sync-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000504" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="49">
                <identifier>async-update-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000505" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="50">
                <identifier>cleanup-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000506" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="51">
                <identifier>report-tasks-view</identifier>
                <display>
                    <label>Report task</label>
                    <pluralLabel>
                        <orig>Report tasks</orig>
                        <norm>report tasks</norm>
                        <translation>
                            <key>ReportTasks.title</key>
                        </translation>
                    </pluralLabel>
                    <icon>
                        <cssClass>fa fa-chart-pie</cssClass>
                        <color>green</color>
                    </icon>
                </display>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0002-000000000007" relation="org:default" type="c:ObjectCollectionType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="52">
                <identifier>non-iterative-bulk-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000508" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="53">
                <identifier>iterative-bulk-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000509" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="54">
                <identifier>report-import-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000510" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="55">
                <identifier>export-report-tasks-view</identifier>
                <applicableForOperation>add</applicableForOperation>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000511" relation="org:default" type="c:ArchetypeType">
                        <!-- Report export task -->
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="56">
                <identifier>export-report-distributed-tasks-view</identifier>
                <applicableForOperation>add</applicableForOperation>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000512" relation="org:default" type="c:ArchetypeType">
                        <!-- Distributed report export task -->
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="57">
                <identifier>shadow-integrity-check-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000513" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="58">
                <identifier>shadows-refresh-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000514" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="59">
                <identifier>objects-delete-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000515" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="60">
                <identifier>shadows-delete-long-time-not-updated-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000516" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="61">
                <identifier>execute-change-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000517" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="62">
                <identifier>execute-deltas-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000518" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="63">
                <identifier>reindex-repository-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000519" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="64">
                <identifier>object-integrity-check-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000522" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="65">
                <identifier>validity-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000530" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="66">
                <identifier>trigger-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000531" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="67">
                <identifier>propagation-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000532" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="68">
                <identifier>multi-propagation-task-view</identifier>
                <refreshInterval>30</refreshInterval>
                <applicableForOperation>add</applicableForOperation>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000533" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="69">
                <identifier>certification-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000520" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="70">
                <identifier>approval-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000521" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="71">
                <identifier>utility-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000528" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="72">
                <identifier>system-tasks-view</identifier>
                <refreshInterval>30</refreshInterval>
                <type>TaskType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000529" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="73">
                <identifier>dashboard-reports-view</identifier>
                <type>ReportType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000170" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="74">
                <identifier>collection-reports-view</identifier>
                <type>ReportType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000171" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="75">
                <identifier>application-role</identifier>
                <applicableForOperation>add</applicableForOperation>
                <type>RoleType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000328" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="76">
                <identifier>business-role</identifier>
                <applicableForOperation>add</applicableForOperation>
                <type>RoleType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000321" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="77">
                <identifier>application</identifier>
                <display>
                    <label>Application.panel.applications</label>
                </display>
                <type>ServiceType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000329" relation="org:default" type="c:ArchetypeType"/>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="78">
                <identifier>event-mark</identifier>
                <type>c:MarkType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000700" relation="org:default" type="c:ArchetypeType">
                        <!-- Event mark -->
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="79">
                <identifier>object-mark</identifier>
                <type>c:MarkType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000701" relation="org:default" type="c:ArchetypeType">
                        <!-- Object mark -->
                    </collectionRef>
                </collection>
            </objectCollectionView>
            <objectCollectionView id="80">
                <description>Persons</description>
                <documentation>This view displays all users with archetype "Person"</documentation>
                <identifier>person-view</identifier>
                <displayOrder>10</displayOrder>
                <type>UserType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0000-000000000702" relation="org:default" type="c:ArchetypeType">
                        <!-- Person -->
                    </collectionRef>
                </collection>
                <searchBoxConfiguration>
                    <searchItems>
                        <searchItem id="81">
                            <description>Allow searching for users having account on specific resource. Intent is not considered. The search item is not displayed by default
                                (visibleByDefault=false).
                            </description>
                            <visibleByDefault>true</visibleByDefault>
                            <filter>
                                <q:text>
                                    linkRef/@ matches (
                                    . type ShadowType
                                    and resourceRef/@/name = `resourceParameter?.getName()?.getOrig()`
                                    and kind = "account" )
                                </q:text>
                            </filter>
                            <display>
                                <label>Users with account</label>
                            </display>
                            <parameter>
                                <name>resourceParameter</name>
                                <type>c:ObjectReferenceType</type>
                                <targetType>ResourceType</targetType>
                            </parameter>
                        </searchItem>
                        <searchItem id="82">
                            <description>Allow searching for users not having account on specific resource. Intent is not considered. The search item is not displayed by default
                                (visibleByDefault=false).
                            </description>
                            <visibleByDefault>true</visibleByDefault>
                            <filter>
                                <q:text>
                                    linkRef/@ not matches (
                                    . type ShadowType
                                    and resourceRef/@/name = `resourceParameter?.getName()?.getOrig()`
                                    and kind = "account" )
                                </q:text>
                            </filter>
                            <display>
                                <label>Users without account</label>
                            </display>
                            <parameter>
                                <name>resourceParameter</name>
                                <type>c:ObjectReferenceType</type>
                                <targetType>ResourceType</targetType>
                            </parameter>
                        </searchItem>
                    </searchItems>
                </searchBoxConfiguration>
            </objectCollectionView>
            <objectCollectionView>
                <identifier>resource-templates</identifier>
                <display>
                    <label>
                        <orig>Resource templates</orig>
                        <translation>
                            <key>ResourceType.templates.title</key>
                        </translation>
                    </label>
                    <pluralLabel>
                        <orig>All resource templates</orig>
                        <translation>
                            <key>ResourceType.template.all.title</key>
                        </translation>
                    </pluralLabel>
                    <singularLabel>Resource template</singularLabel>
                    <icon>
                        <cssClass>fa fa-file-alt</cssClass>
                    </icon>
                </display>
                <type>ResourceType</type>
                <collection>
                    <collectionRef oid="00000000-0000-0000-0001-000000000340" relation="org:default" type="c:ObjectCollectionType">
                    </collectionRef>
                </collection>
            </objectCollectionView>
        </objectCollectionViews>
        <objectDetails>
            <objectDetailsPage id="83">
                <type>c:TaskType</type>
                <panel id="85">
                    <identifier>advanced-options-panel</identifier>
                    <display>
                        <label>
                            <orig>Advanced options</orig>
                            <translation>
                                <key>TaskType.advancedOptions</key>
                            </translation>
                        </label>
                    </display>
                    <panelType>formPanel</panelType>
                    <container id="87">
                        <identifier>advanced-options</identifier>
                        <displayOrder>150</displayOrder>
                        <display>
                            <label>Advanced options</label>
                        </display>
                        <item id="88">
                            <c:path>cleanupAfterCompletion</c:path>
                        </item>
                        <item id="89">
                            <c:path>threadStopAction</c:path>
                        </item>
                        <item id="90">
                            <c:path>binding</c:path>
                        </item>
                        <item id="91">
                            <c:path>dependent</c:path>
                        </item>
                    </container>
                </panel>
                <panel id="86">
                    <identifier>operational-attributes-panel</identifier>
                    <display>
                        <label>
                            <orig>Operational attributes</orig>
                            <translation>
                                <key>TaskType.operationalAttributes</key>
                            </translation>
                        </label>
                    </display>
                    <panelType>formPanel</panelType>
                    <container id="92">
                        <identifier>operational-attributes</identifier>
                        <displayOrder>900</displayOrder>
                        <display>
                            <label>Operational attributes (state)</label>
                        </display>
                        <item id="94">
                            <c:path>executionState</c:path>
                        </item>
                        <item id="95">
                            <c:path>schedulingState</c:path>
                        </item>
                        <item id="96">
                            <c:path>node</c:path>
                        </item>
                        <item id="97">
                            <c:path>nodeAsObserved</c:path>
                        </item>
                        <item id="98">
                            <c:path>resultStatus</c:path>
                        </item>
                        <item id="99">
                            <c:path>result</c:path>
                        </item>
                        <item id="100">
                            <c:path>nextRunStartTimestamp</c:path>
                        </item>
                        <item id="101">
                            <c:path>nextRetryTimestamp</c:path>
                        </item>
                        <item id="102">
                            <c:path>unpauseAction</c:path>
                        </item>
                        <item id="103">
                            <c:path>taskIdentifier</c:path>
                        </item>
                        <item id="104">
                            <c:path>parent</c:path>
                        </item>
                        <item id="105">
                            <c:path>waitingReason</c:path>
                        </item>
                        <item id="106">
                            <c:path>stateBeforeSuspend</c:path>
                        </item>
                        <item id="107">
                            <path>schedulingStateBeforeSuspend</path>
                        </item>
                        <item id="108">
                            <c:path>otherHandlersUriStack</c:path>
                        </item>
                        <item id="109">
                            <c:path>channel</c:path>
                        </item>
                        <item id="110">
                            <c:path>subtaskRef</c:path>
                        </item>
                        <item id="111">
                            <c:path>dependentTaskRef</c:path>
                        </item>
                        <item id="112">
                            <c:path>lastRunStartTimestamp</c:path>
                        </item>
                        <item id="113">
                            <c:path>lastRunFinishTimestamp</c:path>
                        </item>
                        <item id="114">
                            <c:path>completionTimestamp</c:path>
                        </item>
                    </container>
                    <container id="93">
                        <displayOrder>910</displayOrder>
                        <visibility>hidden</visibility>
                        <identifier>operation-attributes-progress</identifier>
                        <display>
                            <label>Operational attributes (progress)</label>
                        </display>
                        <item id="115">
                            <c:path>progress</c:path>
                        </item>
                        <item id="116">
                            <c:path>expectedTotal</c:path>
                        </item>
                        <item id="117">
                            <c:path>stalledSince</c:path>
                        </item>
                    </container>
                </panel>
            </objectDetailsPage>
            <objectDetailsPage id="84">
                <type>c:UserType</type>
                <panel id="118">
                    <identifier>applications</identifier>
                    <display>
                        <label>Application.panel.applications</label>
                    </display>
                    <applicableForOperation>modify</applicableForOperation>
                    <panelType>roleMemberships</panelType>
                    <listView>
                        <identifier>applications</identifier>
                        <type>c:ServiceType</type>
                        <collection>
                            <collectionRef oid="00000000-0000-0000-0001-000000000017" type="c:ObjectCollectionType"/>
                        </collection>
                        <searchBoxConfiguration>
                            <objectTypeConfiguration>
                                <visibility>hidden</visibility>
                                <defaultValue>ServiceType</defaultValue>
                                <supportedTypes>ServiceType</supportedTypes>
                            </objectTypeConfiguration>
                        </searchBoxConfiguration>
                    </listView>
                </panel>
            </objectDetailsPage>
            <resourceDetailsPage id="119">
                <panel id="123">
                    <identifier>rw-type-basic</identifier>
                    <container id="130">
                        <identifier>basic</identifier>
                        <display>
                            <label>PageResource.wizard.step.objectType.basicSettings</label>
                        </display>
                        <item id="132">
                            <path>schemaHandling/objectType/displayName</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="133">
                            <path>schemaHandling/objectType/description</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="134">
                            <path>schemaHandling/objectType/kind</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="135">
                            <path>schemaHandling/objectType/intent</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="136">
                            <path>schemaHandling/objectType/securityPolicyRef</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="137">
                            <path>schemaHandling/objectType/default</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="131">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType</path>
                    </container>
                    <panelType>rw-type-basic</panelType>
                </panel>
                <panel id="124">
                    <identifier>rw-type-delineation</identifier>
                    <container id="138">
                        <identifier>delineation</identifier>
                        <display>
                            <label>PageResource.wizard.step.objectType.delineation</label>
                        </display>
                        <item id="140">
                            <path>schemaHandling/objectType/delineation/objectClass</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="141">
                            <path>schemaHandling/objectType/delineation/auxiliaryObjectClass</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="142">
                            <path>schemaHandling/objectType/delineation/searchHierarchyScope</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="143">
                            <path>schemaHandling/objectType/delineation/filter</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="144">
                            <path>schemaHandling/objectType/delineation/classificationCondition</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="139">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType/delineation</path>
                    </container>
                    <panelType>rw-type-delineation</panelType>
                </panel>
                <panel id="125">
                    <identifier>rw-attribute-limitations</identifier>
                    <container id="145">
                        <identifier>limitationsMapping</identifier>
                        <display>
                            <label>PageResource.wizard.step.attributes.limitation</label>
                        </display>
                        <item id="147">
                            <path>schemaHandling/objectType/attribute/limitations/access/read</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="148">
                            <path>schemaHandling/objectType/attribute/limitations/access/add</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="149">
                            <path>schemaHandling/objectType/attribute/limitations/access/modify</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="150">
                            <path>schemaHandling/objectType/attribute/limitations/minOccurs</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="151">
                            <path>schemaHandling/objectType/attribute/limitations/maxOccurs</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="152">
                            <path>schemaHandling/objectType/attribute/limitations/processing</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="146">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType/attribute/limitations</path>
                    </container>
                    <panelType>rw-attribute-limitations</panelType>
                </panel>
                <panel id="126">
                    <identifier>rw-synchronization-reaction-main</identifier>
                    <container id="153">
                        <identifier>reactionMainSetting</identifier>
                        <display>
                            <label>PageResource.wizard.step.synchronization.reaction.mainSettings</label>
                        </display>
                        <item id="155">
                            <path>schemaHandling/objectType/synchronization/reaction/name</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="156">
                            <path>schemaHandling/objectType/synchronization/reaction/description</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="157">
                            <path>schemaHandling/objectType/synchronization/reaction/situation</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="154">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType/synchronization/reaction</path>
                    </container>
                    <panelType>rw-synchronization-reaction-main</panelType>
                </panel>
                <panel id="127">
                    <identifier>rw-synchronization-reaction-optional</identifier>
                    <container id="158">
                        <identifier>reactionOptionalSetting</identifier>
                        <display>
                            <label>PageResource.wizard.step.synchronization.reaction.optionalSettings</label>
                        </display>
                        <item id="160">
                            <path>schemaHandling/objectType/synchronization/reaction/condition</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="161">
                            <path>schemaHandling/objectType/synchronization/reaction/channel</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="162">
                            <path>schemaHandling/objectType/synchronization/reaction/order</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="159">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType/synchronization/reaction</path>
                    </container>
                    <panelType>rw-synchronization-reaction-optional</panelType>
                </panel>
                <panel id="128">
                    <identifier>rw-attribute</identifier>
                    <container id="163">
                        <identifier>mainConfigurationAttribute</identifier>
                        <display>
                            <label>PageResource.wizard.step.attributes.mainConfiguration</label>
                        </display>
                        <item id="165">
                            <path>schemaHandling/objectType/attribute/ref</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="166">
                            <path>schemaHandling/objectType/attribute/displayName</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="167">
                            <path>schemaHandling/objectType/attribute/help</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="168">
                            <path>schemaHandling/objectType/attribute/description</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="169">
                            <path>schemaHandling/objectType/attribute/tolerant</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="170">
                            <path>schemaHandling/objectType/attribute/exclusiveStrong</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="171">
                            <path>schemaHandling/objectType/attribute/readReplaceMode</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="172">
                            <path>schemaHandling/objectType/attribute/fetchStrategy</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="173">
                            <path>schemaHandling/objectType/attribute/matchingRule</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="164">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType/attribute</path>
                    </container>
                    <panelType>rw-attribute</panelType>
                </panel>
                <panel id="129">
                    <identifier>rw-association</identifier>
                    <container id="174">
                        <identifier>association</identifier>
                        <display>
                            <label>PageResource.wizard.step.associations</label>
                        </display>
                        <item id="176">
                            <path>schemaHandling/objectType/association/ref</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="177">
                            <path>schemaHandling/objectType/association/displayName</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="178">
                            <path>schemaHandling/objectType/association/description</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="179">
                            <path>schemaHandling/objectType/association/auxiliaryObjectClass</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="180">
                            <path>schemaHandling/objectType/association/kind</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="181">
                            <path>schemaHandling/objectType/association/intent</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="182">
                            <path>schemaHandling/objectType/association/direction</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="183">
                            <path>schemaHandling/objectType/association/associationAttribute</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="184">
                            <path>schemaHandling/objectType/association/shortcutAssociationAttribute</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="185">
                            <path>schemaHandling/objectType/association/valueAttribute</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="186">
                            <path>schemaHandling/objectType/association/shortcutValueAttribute</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="187">
                            <path>schemaHandling/objectType/association/explicitReferentialIntegrity</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="175">
                        <visibility>hidden</visibility>
                        <path>schemaHandling/objectType/association</path>
                    </container>
                    <panelType>rw-association</panelType>
                </panel>
            </resourceDetailsPage>
            <resourceDetailsPage id="120">
                <panel id="188">
                    <identifier>rw-connectorConfiguration-partial</identifier>
                    <container id="189">
                        <identifier>required</identifier>
                        <display>
                            <label>PageResource.wizard.step.configuration</label>
                        </display>
                        <item id="191">
                            <path>connectorConfiguration/configurationProperties/jdbcUrlTemplate</path>
                        </item>
                        <item id="192">
                            <path>connectorConfiguration/configurationProperties/jdbcDriver</path>
                        </item>
                        <item id="193">
                            <path>connectorConfiguration/configurationProperties/password</path>
                        </item>
                        <item id="194">
                            <path>connectorConfiguration/configurationProperties/user</path>
                        </item>
                        <item id="195">
                            <path>connectorConfiguration/configurationProperties/port</path>
                        </item>
                        <item id="196">
                            <path>connectorConfiguration/configurationProperties/host</path>
                        </item>
                        <item id="197">
                            <path>connectorConfiguration/configurationProperties/database</path>
                        </item>
                    </container>
                    <container id="190">
                        <visibility>hidden</visibility>
                        <path>connectorConfiguration/configurationProperties</path>
                    </container>
                    <panelType>rw-connectorConfiguration-partial</panelType>
                </panel>
                <connectorRef type="ConnectorType">
                    <resolutionTime>run</resolutionTime>
                    <filter>
                        <q:and>
                            <q:equal>
                                <q:path>connectorType</q:path>
                                <q:value>org.identityconnectors.databasetable.DatabaseTableConnector</q:value>
                            </q:equal>
                            <q:equal>
                                <q:path>available</q:path>
                                <q:value>true</q:value>
                            </q:equal>
                        </q:and>
                    </filter>
                </connectorRef>
            </resourceDetailsPage>
            <resourceDetailsPage id="121">
                <panel id="198">
                    <identifier>rw-connectorConfiguration-partial</identifier>
                    <container id="199">
                        <identifier>required</identifier>
                        <display>
                            <label>PageResource.wizard.step.configuration</label>
                        </display>
                        <item id="201">
                            <path>connectorConfiguration/configurationProperties/host</path>
                        </item>
                        <item id="202">
                            <path>connectorConfiguration/configurationProperties/port</path>
                        </item>
                        <item id="203">
                            <path>connectorConfiguration/configurationProperties/connectionSecurity</path>
                        </item>
                        <item id="204">
                            <path>connectorConfiguration/configurationProperties/bindDn</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="205">
                            <path>connectorConfiguration/configurationProperties/bindPassword</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="200">
                        <visibility>hidden</visibility>
                        <path>connectorConfiguration/configurationProperties</path>
                    </container>
                    <panelType>rw-connectorConfiguration-partial</panelType>
                </panel>
                <connectorRef type="ConnectorType">
                    <resolutionTime>run</resolutionTime>
                    <filter>
                        <q:and>
                            <q:equal>
                                <q:path>connectorType</q:path>
                                <q:value>com.evolveum.polygon.connector.ldap.LdapConnector</q:value>
                            </q:equal>
                            <q:equal>
                                <q:path>available</q:path>
                                <q:value>true</q:value>
                            </q:equal>
                        </q:and>
                    </filter>
                </connectorRef>
            </resourceDetailsPage>
            <resourceDetailsPage id="122">
                <panel id="206">
                    <identifier>rw-connectorConfiguration-partial</identifier>
                    <container id="207">
                        <identifier>required</identifier>
                        <display>
                            <label>PageResource.wizard.step.configuration</label>
                        </display>
                        <item id="209">
                            <path>connectorConfiguration/configurationProperties/host</path>
                        </item>
                        <item id="210">
                            <path>connectorConfiguration/configurationProperties/port</path>
                        </item>
                        <item id="211">
                            <path>connectorConfiguration/configurationProperties/connectionSecurity</path>
                        </item>
                        <item id="212">
                            <path>connectorConfiguration/configurationProperties/bindDn</path>
                            <visibility>visible</visibility>
                        </item>
                        <item id="213">
                            <path>connectorConfiguration/configurationProperties/bindPassword</path>
                            <visibility>visible</visibility>
                        </item>
                    </container>
                    <container id="208">
                        <visibility>hidden</visibility>
                        <path>connectorConfiguration/configurationProperties</path>
                    </container>
                    <panelType>rw-connectorConfiguration-partial</panelType>
                </panel>
                <connectorRef type="ConnectorType">
                    <resolutionTime>run</resolutionTime>
                    <filter>
                        <q:and>
                            <q:equal>
                                <q:path>connectorType</q:path>
                                <q:value>com.evolveum.polygon.connector.ldap.ad.AdLdapConnector</q:value>
                            </q:equal>
                            <q:equal>
                                <q:path>available</q:path>
                                <q:value>true</q:value>
                            </q:equal>
                        </q:and>
                    </filter>
                </connectorRef>
            </resourceDetailsPage>
        </objectDetails>
        <configurableUserDashboard id="214">
            <identifier>admin-dashboard</identifier>
            <configurableDashboardRef oid="00000000-0000-0000-0001-000000000001" relation="org:default" type="c:DashboardType"/>
        </configurableUserDashboard>
        <accessRequest>
            <roleCatalog>
                <collection id="215">
                    <identifier>allRoles</identifier>
                    <default>true</default>
                    <collectionIdentifier>allRoles</collectionIdentifier>
                </collection>
                <collection id="216">
                    <identifier>allOrgs</identifier>
                    <collectionIdentifier>allOrgs</collectionIdentifier>
                </collection>
                <collection id="217">
                    <identifier>allServices</identifier>
                    <collectionIdentifier>allServices</collectionIdentifier>
                </collection>
            </roleCatalog>
        </accessRequest>
    </adminGuiConfiguration>

    <expressions>
        <expressionProfile id="218">
            <identifier>safe</identifier>
            <description>
                "Safe" expression profile. It is supposed to contain only operations that are "safe",
                i.e. operations that have very little risk to harm the system, circumvent midPoint security
                and so on. Use of those operations should be reasonably safe in all expressions.
                However, there are limitations. This profile may incomplete or it may even be not completely secure.
                Proper security testing of this profile was not yet conducted. It is provided here "AS IS",
                without any guarantees. Use at your own risk.
            </description>
            <decision>deny</decision> <!-- default decision of those evaluators that are not explicitly enumerated. -->
            <evaluator id="219">
                <type>asIs</type>
                <decision>allow</decision>
            </evaluator>
            <evaluator id="220">
                <type>path</type>
                <decision>allow</decision>
            </evaluator>
            <evaluator id="221">
                <type>value</type>
                <decision>allow</decision>
            </evaluator>
            <evaluator id="222">
                <type>const</type>
                <decision>allow</decision>
            </evaluator>
            <evaluator id="223">
                <type>script</type>
                <decision>deny</decision> <!-- default decision of those script languages that are not explicitly enumerated. -->
                <script id="224">
                    <language>http://midpoint.evolveum.com/xml/ns/public/expression/language#Groovy</language>
                    <decision>allow</decision>
                    <typeChecking>true</typeChecking>
                    <permissionProfile>script-safe</permissionProfile>
                </script>
            </evaluator>
        </expressionProfile>
        <permissionProfile id="225">
            <identifier>script-safe</identifier>
            <decision>deny</decision> <!-- Default decision for those classes that are not explicitly enumerated. -->
            <package id="226">
                <name>com.evolveum.midpoint.xml.ns._public.common.common_3</name>
                <description>MidPoint common schema - generated bean classes</description>
                <decision>allow</decision>
            </package>
            <package id="227">
                <name>com.evolveum.prism.xml.ns._public.types_3</name>
                <description>Prism schema - bean classes</description>
                <decision>allow</decision>
            </package>
            <class id="228">
                <name>java.lang.Integer</name>
                <decision>allow</decision>
            </class>
            <class id="229">
                <name>java.lang.Object</name>
                <description>Basic Java operations.</description>
                <decision>deny</decision>
                <method id="247">
                    <name>equals</name>
                    <decision>allow</decision>
                </method>
                <method id="248">
                    <name>hashCode</name>
                    <decision>allow</decision>
                </method>
            </class>
            <class id="230">
                <name>java.lang.String</name>
                <description>String operations are generally safe. But Groovy is adding execute() method which is very dangerous.</description>
                <decision>allow</decision> <!-- Default decision for those methods that are not explicitly enumerated. -->
                <method id="249">
                    <name>execute</name>
                    <decision>deny</decision>
                </method>
            </class>
            <class id="231">
                <name>java.lang.CharSequence</name>
                <decision>allow</decision>
            </class>
            <class id="232">
                <name>java.lang.Enum</name>
                <decision>allow</decision>
            </class>
            <class id="233">
                <name>java.util.List</name>
                <description>List operations are generally safe. But Groovy is adding execute() method which is very dangerous.</description>
                <decision>allow</decision>
                <method id="250">
                    <name>execute</name>
                    <decision>deny</decision>
                </method>
            </class>
            <class id="234">
                <name>java.util.ArrayList</name>
                <description>List operations are generally safe. But Groovy is adding execute() method which is very dangerous.</description>
                <decision>allow</decision>
                <method id="251">
                    <name>execute</name>
                    <decision>deny</decision>
                </method>
            </class>
            <class id="235">
                <name>java.util.Map</name>
                <decision>allow</decision>
            </class>
            <class id="236">
                <name>java.util.HashMap</name>
                <decision>allow</decision>
            </class>
            <class id="237">
                <name>java.util.Date</name>
                <decision>allow</decision>
            </class>
            <class id="238">
                <name>javax.xml.namespace.QName</name>
                <decision>allow</decision>
            </class>
            <class id="239">
                <name>javax.xml.datatype.XMLGregorianCalendar</name>
                <decision>allow</decision>
            </class>
            <class id="240">
                <name>java.lang.System</name>
                <description>Just a few methods of System are safe enough.</description>
                <decision>deny</decision>
                <method id="252">
                    <name>currentTimeMillis</name>
                    <decision>allow</decision>
                </method>
            </class>
            <class id="241">
                <name>java.lang.IllegalStateException</name>
                <description>Basic Java exception. Also used in test.</description>
                <decision>allow</decision>
            </class>
            <class id="242">
                <name>java.lang.IllegalArgumentException</name>
                <description>Basic Java exception.</description>
                <decision>allow</decision>
            </class>
            <class id="243">
                <name>com.evolveum.midpoint.model.common.expression.functions.BasicExpressionFunctions</name>
                <description>MidPoint basic functions library</description>
                <decision>allow</decision>
            </class>
            <class id="244">
                <name>com.evolveum.midpoint.model.common.expression.functions.LogExpressionFunctions</name>
                <description>MidPoint logging functions library</description>
                <decision>allow</decision>
            </class>
            <class id="245">
                <name>com.evolveum.midpoint.report.impl.ReportFunctions</name>
                <description>MidPoint report functions library</description>
                <decision>allow</decision>
            </class>
            <class id="246">
                <name>org.apache.commons.lang3.StringUtils</name>
                <description>Apache Commons: Strings</description>
                <decision>allow</decision>
            </class>

            <!-- Following may be needed for audit reports. But they may not be completely safe.
                 Therefore the following section is commented out. Please closely evaluate those rules
                 before using them. -->
            <!--  <class>
                <name>com.evolveum.midpoint.schema.expression.VariablesMap</name>
                <description>Expression variables map.</description>
                <decision>deny</decision>
                <method>
                    <name>get</name>
                    <decision>allow</decision>
                </method>
                <method>
                    <name>remove</name>
                    <decision>allow</decision>
                </method>
            </class>
            <class>
                <name>com.evolveum.midpoint.schema.expression.TypedValue</name>
                <description>Typed values, holding expression variables. Read-only access.</description>
                <decision>deny</decision>
                <method>
                    <name>getValue</name>
                    <decision>allow</decision>
                </method>
            </class>
            <class>
                <name>com.evolveum.midpoint.report.impl.ReportUtils</name>
                <decision>deny</decision>
                <method>
                    <name>convertDateTime</name>
                    <decision>allow</decision>
                </method>
                <method>
                    <name>getPropertyString</name>
                    <decision>allow</decision>
                </method>
                <method>
                    <name>printDelta</name>
                    <decision>allow</decision>
                </method>
            </class>
            <class>
                <name>com.evolveum.midpoint.prism.PrismReferenceValue</name>
                <decision>allow</decision>
            </class> -->
        </permissionProfile>
    </expressions>

</systemConfiguration>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/resource-tasks/ed-id/995-task-ed-id-users-livesync.xml

```typescript
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      oid="d732779b-d86a-4341-af42-12da46a1bb28">
    <name>Inbound ED ID Users Livesync</name>
    <iteration>0</iteration>
    <iterationToken/>
    <assignment id="1">
        <targetRef oid="00000000-0000-0000-0000-000000000504" relation="org:default" type="c:ArchetypeType">
            <!-- Live synchronization task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <archetypeRef oid="00000000-0000-0000-0000-000000000504" relation="org:default" type="c:ArchetypeType">
        <!-- Live synchronization task -->
    </archetypeRef>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000504" relation="org:default" type="c:ArchetypeType">
        <!-- Live synchronization task -->
    </roleMembershipRef>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType">
        <!-- administrator -->
    </ownerRef>
    <objectRef oid="534a8b3e-e05a-46ed-8a71-3f9ce98656c5" relation="org:default" type="c:ResourceType">
        <!-- Inbound ED ID LDAP Source -->
    </objectRef>
    <binding>loose</binding>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <schedule>
        <recurrence>recurring</recurrence>
        <interval>30</interval>
        <misfireAction>executeImmediately</misfireAction>
    </schedule>
    <activity>
        <work>
            <liveSynchronization>
                <resourceObjects>
                    <resourceRef oid="534a8b3e-e05a-46ed-8a71-3f9ce98656c5" relation="org:default" type="c:ResourceType">
                        <!-- Inbound ED ID LDAP Source -->
                    </resourceRef>
                    <objectclass>ri:virginiaTechPerson</objectclass>
                </resourceObjects>
            </liveSynchronization>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <situation>
                        <errorCategory>generic</errorCategory>
                    </situation>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
    </activity>
</task>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/resource-tasks/ed-id/995-task-ed-id-users-reconciliation.xml

```typescript
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3" 
    xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3" 
    xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3" 
    xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3" 
    xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3" 
    xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" 
    xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    oid="3b1318b9-0c26-4890-9780-41f41b5dd334">
    <name>ED ID Users Reconciliation</name>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
            <!-- Reconciliation task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <iteration>0</iteration>
    <iterationToken/>
    <archetypeRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
        <!-- Reconciliation task -->
    </archetypeRef>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
        <!-- Reconciliation task -->
    </roleMembershipRef>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType">
        <!-- administrator -->
    </ownerRef>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <objectRef oid="534a8b3e-e05a-46ed-8a71-3f9ce98656c5" relation="org:default" type="c:ResourceType">
        <!-- ED ID LDAP -->
    </objectRef>
    <binding>loose</binding>
    <schedule>
        <recurrence>recurring</recurrence>
        <cronLikePattern>0 0 1 * * ? *</cronLikePattern>
        <misfireAction>reschedule</misfireAction>
    </schedule>
    <activity>
        <work>
            <reconciliation>
                <resourceObjects>
                    <resourceRef oid="534a8b3e-e05a-46ed-8a71-3f9ce98656c5" relation="org:default" type="c:ResourceType">
                        <!-- ED ID LDAP -->
                    </resourceRef>
                    <kind>account</kind>
                    <objectclass>ri:virginiaTechPerson</objectclass>
                </resourceObjects>
            </reconciliation>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
        <distribution>
            <workerThreads>4</workerThreads>
        </distribution>
    </activity>
    </task>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/resource-tasks/midpoint-ad/995-task-ad-security-user-import.xml

```typescript
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      oid="264b72a5-c318-4bdb-b1d9-31321d8d5964">
    <name>Link Existing Users From AD</name>
    <description>Links existing users via authId to sAMAccountName in AD. The users is required to be linked before AD group membership can be set.</description>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000503" relation="org:default" type="c:ArchetypeType">
            <!-- Import task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <iteration>0</iteration>
    <iterationToken/>
    <archetypeRef oid="00000000-0000-0000-0000-000000000503" relation="org:default" type="c:ArchetypeType">
        <!-- Import task -->
    </archetypeRef>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000503" relation="org:default" type="c:ArchetypeType">
        <!-- Import task -->
    </roleMembershipRef>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType">
        <!-- administrator -->
    </ownerRef>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <objectRef oid="728904ad-59ed-4473-bfac-dc6aebd26d6e" relation="org:default" type="c:ResourceType"/>
    <binding>loose</binding>
    <schedule>
        <recurrence>recurring</recurrence>
        <cronLikePattern>0 0 0 * * ? *</cronLikePattern>
        <misfireAction>reschedule</misfireAction>
    </schedule>
    <activity>
        <work>
            <import>
                <resourceObjects>
                    <resourceRef oid="728904ad-59ed-4473-bfac-dc6aebd26d6e" relation="org:default" type="c:ResourceType"/>
                    <kind>account</kind>
                    <objectclass>ri:user</objectclass>
                </resourceObjects>
            </import>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
        <distribution>
            <workerThreads>4</workerThreads>
        </distribution>
    </activity>
</task>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/resource-tasks/midpoint-grouper-integration/995-task-grouper-groups-recon.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
    xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3" 
    xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3" 
    xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3" 
    xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3" 
    xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" 
    xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    oid="8113bc06-a52c-450c-8b38-3cb521e27a2c">
    <name>Inbound Grouper Groups Reconciliation</name>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
            <!-- Reconciliation task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <iteration>0</iteration>
    <iterationToken/>
    <archetypeRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
        <!-- Reconciliation task -->
    </archetypeRef>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
        <!-- Reconciliation task -->
    </roleMembershipRef>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType">
        <!-- administrator -->
    </ownerRef>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <objectRef oid="fb0bbf07-e33f-4ddd-85a1-16a7edc237f2" relation="org:default" type="c:ResourceType">
        <!-- Inbound Grouper Groups Source -->
    </objectRef>
    <binding>loose</binding>
    <schedule>
        <recurrence>recurring</recurrence>
        <cronLikePattern>0 0 23 * * ? *</cronLikePattern> <!-- Consider to setting once a week after initial import?!? -->
        <misfireAction>executeImmediately</misfireAction>
    </schedule>
    <activity>
        <work>
            <reconciliation>
                <resourceObjects>
                    <resourceRef oid="fb0bbf07-e33f-4ddd-85a1-16a7edc237f2" relation="org:default" type="c:ResourceType">
                        <!-- Inbound Grouper Groups Source -->
                    </resourceRef>
                    <kind>entitlement</kind>
                    <objectclass>ri:group</objectclass>
                </resourceObjects>
            </reconciliation>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
    </activity>
</task>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/resource-tasks/midpoint-grouper-integration/995-task-grouper-members-recon.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
    xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3" 
    xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3" 
    xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3" 
    xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3" 
    xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3" 
    xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    oid="63604fb1-065b-4e56-ad2f-f78e588f52f0">
    <name>Inbound Grouper Memberships Reconciliation</name>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
            <!-- Reconciliation task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <iteration>0</iteration>
    <iterationToken/>
    <archetypeRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
        <!-- Reconciliation task -->
    </archetypeRef>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000501" relation="org:default" type="c:ArchetypeType">
        <!-- Reconciliation task -->
    </roleMembershipRef>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType">
        <!-- administrator -->
    </ownerRef>
    <objectRef oid="fb0bbf07-e33f-4ddd-85a1-16a7edc237f2" relation="org:default" type="c:ResourceType">
        <!-- Inbound Grouper Groups Source -->
    </objectRef>
    <binding>loose</binding>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <schedule>
        <recurrence>recurring</recurrence>
        <cronLikePattern>0 0 22 * * ? *</cronLikePattern> <!-- Consider to setting once a week after initial import?!? -->
        <misfireAction>executeImmediately</misfireAction>
    </schedule>
    <activity>
        <work>
            <reconciliation>
                <resourceObjects>
                    <resourceRef oid="fb0bbf07-e33f-4ddd-85a1-16a7edc237f2" relation="org:default" type="c:ResourceType">
                        <!-- Inbound Grouper Groups Source -->
                    </resourceRef>
                    <kind>account</kind>
                    <objectclass>ri:subject</objectclass>
                </resourceObjects>
            </reconciliation>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
        <distribution>
            <workerThreads>4</workerThreads>
        </distribution>
    </activity>
    </task>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/resource-tasks/midpoint-grouper-integration/995-task-inbound-grouper-groups-livesync.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      oid="552112fc-9546-4e63-a170-339d99a3455e">
    <name>Inbound Grouper Groups Livesync</name>
    <description>Grouper live synchronization task for groups and users.</description>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000504" relation="org:default" type="c:ArchetypeType">
            <!-- Live synchronization task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <schedule>
        <recurrence>recurring</recurrence>
        <interval>30</interval> <!-- Note Evolveum default is 5 seconds which is a continuous task -->
        <misfireAction>executeImmediately</misfireAction>
    </schedule>
    <activity>
        <work>
            <liveSynchronization>
                <resourceObjects>
                    <resourceRef oid="fb0bbf07-e33f-4ddd-85a1-16a7edc237f2" relation="org:default" type="c:ResourceType" />
                </resourceObjects>
            </liveSynchronization>
        </work>
        <executionMode>full</executionMode>
        <!-- TODO test 4.8 and see if we can remove the following should be automatic on livesync tasks -->
        <controlFlow>
            <errorHandling>
                <entry>
                    <situation>
                        <errorCategory>generic</errorCategory>
                    </situation>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
    </activity>
</task>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/utility-tasks/995-task-restart-suspended-tasks.xml

```typescript
<task xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:s="http://midpoint.evolveum.com/xml/ns/public/model/scripting-3"
      xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      oid="4df70dc0-1f92-45e4-b605-222ba7b97d22">
    <name>Resume task in case of suspended state</name>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000509" type="ArchetypeType"/>
    </assignment>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" type="UserType"/>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <schedule>
        <recurrence>recurring</recurrence>
        <interval>86400</interval>
        <misfireAction>executeImmediately</misfireAction>
    </schedule>
    <activity>
        <work>
            <iterativeScripting>
                <objects>
                    <type>TaskType</type>
                    <query>
                        <q:filter>
                            <q:and>
                                <q:or>
                                    <q:ref>
                                        <!-- Restarts livesync tasks -->
                                        <q:path>assignment/targetRef</q:path>
                                        <q:value>
                                            <oid>00000000-0000-0000-0000-000000000504</oid>
                                            <type>ArchetypeType</type>
                                        </q:value>
                                    </q:ref>
                                    <q:equal>
                                        <!-- Restarts ED ID Users Full Reconciliation -->
                                        <q:path>name</q:path>
                                        <q:value>ED ID Users Reconciliation</q:value>
                                    </q:equal>
                                </q:or>
                                <q:equal>
                                    <q:path>schedulingState</q:path>
                                    <q:value>suspended</q:value>
                                </q:equal>
                            </q:and>
                        </q:filter>
                    </query>
                </objects>
                <scriptExecutionRequest>
                    <s:execute>
                        <s:script>
                            <code>
                                log.info('About to resume suspended task {}', input)
                                midpoint.taskManager.resumeTask(input.getOid(), midpoint.currentResult)
                            </code>
                        </s:script>
                    </s:execute>
                </scriptExecutionRequest>
            </iterativeScripting>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
    </activity>
</task>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/utility-tasks/995-task-user-recompute.xml

```typescript
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:icfs="http://midpoint.evolveum.com/xml/ns/public/connector/icf-1/resource-schema-3"
      xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      xmlns:q="http://prism.evolveum.com/xml/ns/public/query-3"
      xmlns:ri="http://midpoint.evolveum.com/xml/ns/public/resource/instance-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      oid="cd04753c-da1d-4b10-988f-3f1b87c51cab">
    <name>User Recomputation Task</name>
    <iteration>0</iteration>
    <iterationToken/>
    <assignment id="1">
        <targetRef oid="00000000-0000-0000-0000-000000000502" relation="org:default" type="c:ArchetypeType">
            <!-- Recomputation task -->
        </targetRef>
        <activation>
            <effectiveStatus>enabled</effectiveStatus>
        </activation>
    </assignment>
    <archetypeRef oid="00000000-0000-0000-0000-000000000502" relation="org:default" type="c:ArchetypeType">
        <!-- Recomputation task -->
    </archetypeRef>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000502" relation="org:default" type="c:ArchetypeType">
        <!-- Recomputation task -->
    </roleMembershipRef>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType">
        <!-- administrator -->
    </ownerRef>
    <binding>loose</binding>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <!-- TODO Add schedule here, although this may not be needed in light of ED ID Users full reconciliation! -->
    <activity>
        <work>
            <recomputation>
                <objects>
                    <type>c:UserType</type>
                </objects>
            </recomputation>
        </work>
        <controlFlow>
            <errorHandling>
                <entry>
                    <reaction>
                        <retryLater>
                            <initialInterval>PT30M</initialInterval>
                            <nextInterval>PT1H</nextInterval>
                        </retryLater>
                    </reaction>
                </entry>
            </errorHandling>
        </controlFlow>
        <distribution>
            <workerThreads>4</workerThreads>
        </distribution>
    </activity>
</task>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/tasks/utility-tasks/995-task-user-reindex.xml

```typescript
<task xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
     xmlns:org="http://midpoint.evolveum.com/xml/ns/public/common/org-3"
      oid="f33f0191-d39b-48a4-a846-34abd605c88b">
    <name>Reindex Users</name>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000528" relation="org:default" type="c:ArchetypeType"/>
    </assignment>
    <archetypeRef oid="00000000-0000-0000-0000-000000000528" relation="org:default" type="c:ArchetypeType"/>
    <roleMembershipRef oid="00000000-0000-0000-0000-000000000528" relation="org:default" type="c:ArchetypeType"/>
    <ownerRef oid="00000000-0000-0000-0000-000000000002" relation="org:default" type="c:UserType"/>
    <activity>
        <work>
            <reindexing>
                <objects>
                    <type>UserType</type>
                </objects>
            </reindexing>
        </work>
        <distribution>
            <workerThreads>4</workerThreads>
        </distribution>
    </activity>
    <binding>loose</binding>
    <executionState>runnable</executionState>
    <schedulingState>ready</schedulingState>
    <schedule>
        <recurrence>recurring</recurrence>
        <cronLikePattern>0 0 6 ? * 1#1</cronLikePattern>
        <misfireAction>reschedule</misfireAction>
    </schedule>
</task>
```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/post-initial-objects/user/050-user-administrator.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright (c) 2010-2020 Evolveum and contributors
  ~
  ~ This work is dual-licensed under the Apache License 2.0
  ~ and European Union Public License. See LICENSE file for details.
  -->
<user oid="00000000-0000-0000-0000-000000000002"
      xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:c="http://midpoint.evolveum.com/xml/ns/public/common/common-3"
      xmlns:t="http://prism.evolveum.com/xml/ns/public/types-3">
    <name>administrator</name>
    <indestructible>true</indestructible>
    <fullName>midPoint Administrator</fullName>
    <givenName>midPoint</givenName>
    <familyName>Administrator</familyName>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000004" type="RoleType"/> <!-- Superuser -->
    </assignment>
    <assignment>
        <targetRef oid="00000000-0000-0000-0000-000000000300" type="ArchetypeType"/> <!-- System user -->
    </assignment>
    <activation>
        <administrativeStatus>enabled</administrativeStatus>
    </activation>
    <credentials xmlns="http://midpoint.evolveum.com/xml/ns/public/common/common-3">
        <password>
            <value>
                 <t:clearValue>ADMIN_PASSWORD</t:clearValue>
             </value>
        </password>
    </credentials>
</user>

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/sql-scripts/postgres-audit-upgrade.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- This is the update script for the AUDIT database.
-- If you use audit and main repository in a single database, this still must be run as well.
-- It is safe to run this script repeatedly, so if you're not sure, just run it to be up to date.

-- Using psql is strongly recommended, don't use tools with messy autocommit behavior like pgAdmin!
-- Using flag to stop on first error is also recommended, for example:
-- psql -v ON_ERROR_STOP=1 -h localhost -U midaudit -W -d midaudit -f postgres-new-upgrade-audit.sql

-- SCHEMA-COMMIT is a commit which should be used to initialize the DB for testing changes below it.
-- Check out that commit and initialize a fresh DB with postgres-new-audit.sql to test upgrades.

DO $$
    BEGIN
        if to_regproc('apply_audit_change') is null then
            raise exception 'You are running AUDIT UPGRADE script, but the procedure ''apply_audit_change'' is missing.
Are you sure you are running this upgrade script on the correct database?
Current database name is ''%'', schema name is ''%''.
Perhaps you have separate audit database?', current_database(), current_schema();
        end if;
    END
$$;

-- SCHEMA-COMMIT 4.4: commit 69e8c29b

-- changes for 4.4.1

-- support for partition generation in the past using negative argument
call apply_audit_change(1, $aac$
-- Use negative futureCount for creating partitions for the past months if needed.
CREATE OR REPLACE PROCEDURE audit_create_monthly_partitions(futureCount int)
    LANGUAGE plpgsql
AS $$
DECLARE
    dateFrom TIMESTAMPTZ = date_trunc('month', current_timestamp);
    dateTo TIMESTAMPTZ;
    tableSuffix TEXT;
BEGIN
    -- noinspection SqlUnused
    FOR i IN 1..abs(futureCount) loop
        dateTo := dateFrom + interval '1 month';
        tableSuffix := to_char(dateFrom, 'YYYYMM');

        BEGIN
            -- PERFORM = select without using the result
            PERFORM ('ma_audit_event_' || tableSuffix)::regclass;
            RAISE NOTICE 'Tables for partition % already exist, OK...', tableSuffix;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Creating partitions for range: % - %', dateFrom, dateTo;

            -- values FROM are inclusive (>=), TO are exclusive (<)
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_event FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_event_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_delta FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_delta_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_ref FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_ref_' || tableSuffix, dateFrom, dateTo);

            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_delta_' || tableSuffix,
                    'ma_audit_delta_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_ref_' || tableSuffix,
                    'ma_audit_ref_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
        END;

        IF futureCount < 0 THEN
            -- going to the past
            dateFrom := dateFrom - interval '1 month';
        ELSE
            dateFrom := dateTo;
        END IF;

    END loop;
END $$;
$aac$);

-- SCHEMA-COMMIT 4.4.1: commit de18c14f

-- changes for 4.5

-- MID-7484
call apply_audit_change(2, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MESSAGE_TEMPLATE' AFTER 'LOOKUP_TABLE';
$aa$);

-- SCHEMA-COMMIT 4.6: commit 71f2df50

-- changes for 4.7
-- Simulation related changes
call apply_audit_change(3, $aa$
   ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'SIMULATION_RESULT' AFTER 'SHADOW';
   ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MARK' AFTER 'LOOKUP_TABLE';
$aa$);

-- changes for 4.8
-- Shadow auditing
call apply_audit_change(4, $aa$
   ALTER TYPE AuditEventStageType ADD VALUE IF NOT EXISTS 'RESOURCE' AFTER 'EXECUTION';
   ALTER TYPE AuditEventTypeType ADD VALUE IF NOT EXISTS 'DISCOVER_OBJECT' AFTER 'RUN_TASK_IMMEDIATELY';
$aa$);

call apply_audit_change(5, $aa$
   CREATE TYPE EffectivePrivilegesModificationType AS ENUM ('ELEVATION', 'FULL_ELEVATION', 'REDUCTION', 'OTHER');
   ALTER TABLE ma_audit_event
     ADD COLUMN effectivePrincipalOid UUID,
     ADD COLUMN effectivePrincipalType ObjectType,
     ADD COLUMN effectivePrincipalName TEXT,
     ADD COLUMN effectivePrivilegesModification EffectivePrivilegesModificationType;
$aa$);


call apply_audit_change(6, $aa$
   -- We try to create ShadowKindType (necessary if audit is in separate database, if it is in same
   -- database as repository, type already exists.
   DO $$ BEGIN
       CREATE TYPE ShadowKindType AS ENUM ('ACCOUNT', 'ENTITLEMENT', 'GENERIC', 'UNKNOWN');
   EXCEPTION
       WHEN duplicate_object THEN null;
   END $$;

   ALTER TABLE ma_audit_delta
     ADD COLUMN shadowKind ShadowKindType,
     ADD COLUMN shadowIntent TEXT;
$aa$);

-- Role Mining

call apply_audit_change(7, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_CLUSTER' AFTER 'ROLE';
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_SESSION' AFTER 'ROLE_ANALYSIS_CLUSTER';
$aa$);

-- Informatoin Disclosure
call apply_audit_change(8, $aa$
ALTER TYPE AuditEventTypeType ADD VALUE IF NOT EXISTS 'INFORMATION_DISCLOSURE' AFTER 'DISCOVER_OBJECT';
$aa$);

-- WRITE CHANGES ABOVE ^^

-- IMPORTANT: update apply_audit_change number at the end of postgres-audit.sql
-- to match the number used in the last change here!
-- Also update SqaleUtils.CURRENT_SCHEMA_AUDIT_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java

```

## /Users/ddonahoe/code/midpoint/docker/src/main/docker/files/mp-var/sql-scripts/postgres-upgrade.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- This is the update script for the MAIN REPOSITORY, it will not work for a separate audit database.
-- It is safe to run this script repeatedly, so if you're not sure, just run it to be up to date.
-- DO NOT use explicit COMMIT commands inside the apply_change blocks - leave that to the procedure.
-- If necessary, split your changes into multiple apply_changes calls to enforce the commit
-- before another change - for example when adding values to the custom enum types.

-- Using psql is strongly recommended, don't use tools with messy autocommit behavior like pgAdmin!
-- Using flag to stop on first error is also recommended, for example:
-- psql -v ON_ERROR_STOP=1 -h localhost -U midpoint -W -d midpoint -f postgres-new-upgrade.sql

-- SCHEMA-COMMIT is a Git commit which should be used to initialize the DB for testing changes below it.
-- Check out that commit and initialize a fresh DB with postgres-new-audit.sql to test upgrades.

DO $$
    BEGIN
        if to_regproc('apply_change') is null then
            raise exception 'You are running MAIN UPGRADE script, but the procedure ''apply_change'' is missing.
Are you sure you are running this upgrade script on the correct database?
Current database name is ''%'', schema name is ''%''.', current_database(), current_schema();
        end if;
    END
$$;

-- SCHEMA-COMMIT 4.4: commit 20ad200b
-- see: https://github.com/Evolveum/midpoint/blob/20ad200bd10a114fd70d2d131c0d11b5cd920150/config/sql/native-new/postgres-new.sql

-- changes for 4.4.1

-- adding trigger to mark org closure for refresh when org is inserted/deleted
call apply_change(1, $aa$
-- The trigger that flags the view for refresh after m_org changes.
CREATE OR REPLACE FUNCTION mark_org_closure_for_refresh_org()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO m_global_metadata VALUES ('orgClosureRefreshNeeded', 'true')
    ON CONFLICT (name) DO UPDATE SET value = 'true';

    -- after trigger returns null
    RETURN NULL;
END $$;

-- Update is not necessary, it does not change relations between orgs.
-- If it does, it is handled by trigger on m_ref_object_parent_org.
CREATE TRIGGER m_org_mark_refresh_tr
    AFTER INSERT OR DELETE ON m_org
    FOR EACH ROW EXECUTE FUNCTION mark_org_closure_for_refresh_org();
CREATE TRIGGER m_org_mark_refresh_trunc_tr
    AFTER TRUNCATE ON m_org
    FOR EACH STATEMENT EXECUTE FUNCTION mark_org_closure_for_refresh_org();
$aa$);

-- SCHEMA-COMMIT 4.4.1: commit de18c14f

-- changes for 4.5

-- MID-7484
-- We add the new enum value in separate change, because it must be committed before it is used.
call apply_change(2, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MESSAGE_TEMPLATE' AFTER 'LOOKUP_TABLE';
$aa$);

call apply_change(3, $aa$
CREATE TABLE m_message_template (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MESSAGE_TEMPLATE') STORED
        CHECK (objectType = 'MESSAGE_TEMPLATE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_message_template_oid_insert_tr BEFORE INSERT ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_message_template_update_tr BEFORE UPDATE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_message_template_oid_delete_tr AFTER DELETE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_message_template_nameOrig_idx ON m_message_template (nameOrig);
CREATE UNIQUE INDEX m_message_template_nameNorm_key ON m_message_template (nameNorm);
CREATE INDEX m_message_template_policySituation_idx
    ON m_message_template USING gin(policysituations gin__int_ops);
CREATE INDEX m_message_template_createTimestamp_idx ON m_message_template (createTimestamp);
CREATE INDEX m_message_template_modifyTimestamp_idx ON m_message_template (modifyTimestamp);
$aa$);

-- MID-7487 Identity matching
-- We add the new enum value in separate change, because it must be committed before it is used.
call apply_change(4, $aa$
CREATE TYPE CorrelationSituationType AS ENUM ('UNCERTAIN', 'EXISTING_OWNER', 'NO_OWNER', 'ERROR');
$aa$);

call apply_change(5, $aa$
ALTER TABLE m_shadow
ADD COLUMN correlationStartTimestamp TIMESTAMPTZ,
ADD COLUMN correlationEndTimestamp TIMESTAMPTZ,
ADD COLUMN correlationCaseOpenTimestamp TIMESTAMPTZ,
ADD COLUMN correlationCaseCloseTimestamp TIMESTAMPTZ,
ADD COLUMN correlationSituation CorrelationSituationType;

CREATE INDEX m_shadow_correlationStartTimestamp_idx ON m_shadow (correlationStartTimestamp);
CREATE INDEX m_shadow_correlationEndTimestamp_idx ON m_shadow (correlationEndTimestamp);
CREATE INDEX m_shadow_correlationCaseOpenTimestamp_idx ON m_shadow (correlationCaseOpenTimestamp);
CREATE INDEX m_shadow_correlationCaseCloseTimestamp_idx ON m_shadow (correlationCaseCloseTimestamp);
$aa$);

-- SCHEMA-COMMIT 4.5: commit c5f19c9e

-- changes for 4.6

-- MID-7746
-- We add the new enum value in separate change, because it must be committed before it is used.
call apply_change(6, $aa$
CREATE TYPE AdministrativeAvailabilityStatusType AS ENUM ('MAINTENANCE', 'OPERATIONAL');
$aa$);

call apply_change(7, $aa$
ALTER TABLE m_resource
ADD COLUMN administrativeOperationalStateAdministrativeAvailabilityStatus AdministrativeAvailabilityStatusType;
$aa$);

-- smart correlation
call apply_change(8, $aa$
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch; -- fuzzy string match (levenshtein, etc.)

ALTER TYPE ContainerType ADD VALUE IF NOT EXISTS 'FOCUS_IDENTITY' AFTER 'CASE_WORK_ITEM';
$aa$);

call apply_change(9, $aa$
CREATE TABLE m_focus_identity (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('FOCUS_IDENTITY') STORED
        CHECK (containerType = 'FOCUS_IDENTITY'),
    fullObject BYTEA,
    sourceResourceRefTargetOid UUID,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_focus_identity_sourceResourceRefTargetOid_idx ON m_focus_identity (sourceResourceRefTargetOid);

ALTER TABLE m_focus ADD normalizedData JSONB;
CREATE INDEX m_focus_normalizedData_idx ON m_focus USING gin(normalizedData);
$aa$);

-- resource templates
call apply_change(10, $aa$
ALTER TABLE m_resource ADD template BOOLEAN;
$aa$);

-- MID-8053: "Active" connectors detection
call apply_change(11, $aa$
ALTER TABLE m_connector ADD available BOOLEAN;
$aa$);

-- SCHEMA-COMMIT 4.5: commit c5f19c9e

-- No changes for audit schema in 4.6
-- SCHEMA-COMMIT 4.6: commit 71f2df50

-- changes for 4.7

-- Simulations, enum type changes
call apply_change(12, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'MARK' AFTER 'LOOKUP_TABLE';
ALTER TYPE ReferenceType ADD VALUE IF NOT EXISTS 'PROCESSED_OBJECT_EVENT_MARK' AFTER 'PERSONA';
ALTER TYPE ReferenceType ADD VALUE IF NOT EXISTS 'OBJECT_EFFECTIVE_MARK' AFTER 'OBJECT_CREATE_APPROVER';
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'SIMULATION_RESULT' AFTER 'SHADOW';
ALTER TYPE ContainerType ADD VALUE IF NOT EXISTS 'SIMULATION_RESULT_PROCESSED_OBJECT' AFTER 'OPERATION_EXECUTION';
$aa$);

-- Simulations, tables
call apply_change(13, $aa$
CREATE TABLE m_simulation_result (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED
        CHECK (objectType = 'SIMULATION_RESULT'),
    partitioned boolean,
    rootTaskRefTargetOid UUID,
    rootTaskRefTargetType ObjectType,
    rootTaskRefRelationId INTEGER REFERENCES m_uri(id),
    startTimestamp TIMESTAMPTZ,
    endTimestamp TIMESTAMPTZ
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_simulation_result_oid_insert_tr BEFORE INSERT ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_simulation_result_update_tr BEFORE UPDATE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_simulation_result_oid_delete_tr AFTER DELETE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE TYPE ObjectProcessingStateType AS ENUM ('UNMODIFIED', 'ADDED', 'MODIFIED', 'DELETED');

CREATE TABLE m_simulation_result_processed_object (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    -- Owner does not have to be the direct parent of the container.
    -- use like this on the concrete table:
    -- ownerOid UUID NOT NULL REFERENCES m_object_oid(oid),
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    containerType ContainerType GENERATED ALWAYS AS ('SIMULATION_RESULT_PROCESSED_OBJECT') STORED
        CHECK (containerType = 'SIMULATION_RESULT_PROCESSED_OBJECT'),
    oid UUID,
    objectType ObjectType,
    nameOrig TEXT,
    nameNorm TEXT,
    state ObjectProcessingStateType,
    metricIdentifiers TEXT[],
    fullObject BYTEA,
    objectBefore BYTEA,
    objectAfter BYTEA,
    transactionId TEXT,
    focusRecordId BIGINT,

    PRIMARY KEY (ownerOid, cid)
) PARTITION BY LIST(ownerOid);

CREATE TABLE m_simulation_result_processed_object_default PARTITION OF m_simulation_result_processed_object DEFAULT;

CREATE OR REPLACE FUNCTION m_simulation_result_create_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(new.oid::text,'-','_');
      IF new.partitioned AND NOT EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been created %',partition;
        EXECUTE 'CREATE TABLE ' || partition || ' partition of ' || 'm_simulation_result_processed_object' || ' for values in (''' || new.oid|| ''');';
      END IF;
      RETURN NULL;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_create_partition AFTER INSERT ON m_simulation_result
 FOR EACH ROW EXECUTE FUNCTION m_simulation_result_create_partition();

--- Trigger which deletes processed objects partition when whole simulation is deleted

CREATE OR REPLACE FUNCTION m_simulation_result_delete_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(OLD.oid::text,'-','_');
      IF OLD.partitioned AND EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been deleted %',partition;
        EXECUTE 'DROP TABLE IF EXISTS ' || partition || ';';
      END IF;
      RETURN OLD;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_delete_partition BEFORE DELETE ON m_simulation_result
  FOR EACH ROW EXECUTE FUNCTION m_simulation_result_delete_partition();

CREATE TABLE m_processed_object_event_mark (
  ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
  ownerType ObjectType, -- GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED,
  processedObjectCid INTEGER NOT NULL,
  referenceType ReferenceType GENERATED ALWAYS AS ('PROCESSED_OBJECT_EVENT_MARK') STORED,
  targetOid UUID NOT NULL, -- soft-references m_object
  targetType ObjectType NOT NULL,
  relationId INTEGER NOT NULL REFERENCES m_uri(id)

) PARTITION BY LIST(ownerOid);

CREATE TABLE m_processed_object_event_mark_default PARTITION OF m_processed_object_event_mark DEFAULT;

CREATE TABLE m_mark (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MARK') STORED
        CHECK (objectType = 'MARK')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_mark_oid_insert_tr BEFORE INSERT ON m_mark
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_mark_update_tr BEFORE UPDATE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_mark_oid_delete_tr AFTER DELETE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

-- stores ObjectType/effectiveMarkRef
CREATE TABLE m_ref_object_effective_mark (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_EFFECTIVE_MARK') STORED
        CHECK (referenceType = 'OBJECT_EFFECTIVE_MARK'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_effective_mark_targetOidRelationId_idx
    ON m_ref_object_effective_mark (targetOid, relationId);
$aa$);

-- Minor index name fixes
call apply_change(14, $aa$
ALTER INDEX m_ref_object_create_approverTargetOidRelationId_idx
    RENAME TO m_ref_object_create_approver_targetOidRelationId_idx;
ALTER INDEX m_ref_object_modify_approverTargetOidRelationId_idx
    RENAME TO m_ref_object_modify_approver_targetOidRelationId_idx;
$aa$);

-- Making resource.abstract queryable
call apply_change(15, $aa$
ALTER TABLE m_resource ADD abstract BOOLEAN;
$aa$);

-- Task Affected Indexing (Changes to types)
call apply_change(16, $aa$
ALTER TYPE ContainerType ADD VALUE IF NOT EXISTS 'AFFECTED_OBJECTS' AFTER 'ACCESS_CERTIFICATION_WORK_ITEM';
$aa$);

-- Task Affected Indexing (tables), empty now, replaced with change 19

call apply_change(17, $$ SELECT 1 $$, true);


-- Resource/super/resourceRef Indexing (tables)
call apply_change(18, $aa$
ALTER TABLE m_resource
ADD COLUMN superRefTargetOid UUID,
ADD COLUMN superRefTargetType ObjectType,
ADD COLUMN superRefRelationId INTEGER REFERENCES m_uri(id);
$aa$);

-- Fixed upgrade for task indexing
-- Drop tables should only affect development machines
call apply_change(19, $aa$
DROP TABLE IF EXISTS m_task_affected_resource_objects;
DROP TABLE IF EXISTS m_task_affected_objects;

CREATE TABLE m_task_affected_objects (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('AFFECTED_OBJECTS') STORED
     CHECK (containerType = 'AFFECTED_OBJECTS'),
    activityId INTEGER REFERENCES m_uri(id),
    type ObjectType,
    archetypeRefTargetOid UUID,
    archetypeRefTargetType ObjectType,
    archetypeRefRelationId INTEGER REFERENCES m_uri(id),
    objectClassId INTEGER REFERENCES m_uri(id),
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    intent TEXT,
    kind ShadowKindType,
    PRIMARY KEY (ownerOid, cid)
) INHERITS(m_container);

$aa$);

call apply_change(20, $aa$
CREATE TYPE ExecutionModeType AS ENUM ('FULL', 'PREVIEW', 'SHADOW_MANAGEMENT_PREVIEW', 'DRY_RUN', 'NONE', 'BUCKET_ANALYSIS');
CREATE TYPE PredefinedConfigurationType AS ENUM ( 'PRODUCTION', 'DEVELOPMENT' );

ALTER TABLE m_task_affected_objects
  ADD COLUMN executionMode ExecutionModeType,
  ADD COLUMN predefinedConfigurationToUse PredefinedConfigurationType;
$aa$);

call apply_change(21, $aa$
ALTER TABLE m_user
  ADD COLUMN personalNumber TEXT;
$aa$);


-- Role Mining --

call apply_change(22, $aa$
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_CLUSTER' AFTER 'ROLE';
ALTER TYPE ObjectType ADD VALUE IF NOT EXISTS 'ROLE_ANALYSIS_SESSION' AFTER 'ROLE_ANALYSIS_CLUSTER';
$aa$);

call apply_change(23, $aa$
CREATE TABLE m_role_analysis_cluster (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_CLUSTER') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_CLUSTER'),
        parentRefTargetOid UUID,
        parentRefTargetType ObjectType,
        parentRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_cluster_oid_insert_tr BEFORE INSERT ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_cluster_update_tr BEFORE UPDATE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_cluster_oid_delete_tr AFTER DELETE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_role_analysis_cluster_parentRefTargetOid_idx ON m_role_analysis_cluster (parentRefTargetOid);
CREATE INDEX m_role_analysis_cluster_parentRefTargetType_idx ON m_role_analysis_cluster (parentRefTargetType);
CREATE INDEX m_role_analysis_cluster_parentRefRelationId_idx ON m_role_analysis_cluster (parentRefRelationId);


CREATE TABLE m_role_analysis_session (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_SESSION') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_SESSION')
        )
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_session_oid_insert_tr BEFORE INSERT ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_session_update_tr BEFORE UPDATE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_session_oid_delete_tr AFTER DELETE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();
$aa$);

-- Display Name for Connector Type

call apply_change(24, $aa$
    ALTER TABLE m_connector ADD  displayNameOrig TEXT;
    ALTER TABLE m_connector ADD displayNameNorm TEXT;
$aa$);


call apply_change(25, $aa$
CREATE OR REPLACE PROCEDURE m_refresh_org_closure(force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    flag_val text;
BEGIN
    -- We use advisory session lock only for the check + refresh, then release it immediately.
    -- This can still dead-lock two transactions in a single thread on the select/delete combo,
    -- (I mean, who would do that?!) but works fine for parallel transactions.
    PERFORM pg_advisory_lock(47);
    BEGIN
        SELECT value INTO flag_val FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        IF flag_val = 'true' OR force THEN
            REFRESH MATERIALIZED VIEW m_org_closure;
            DELETE FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        END IF;
        PERFORM pg_advisory_unlock(47);
    EXCEPTION WHEN OTHERS THEN
        -- Whatever happens we definitely want to release the lock.
        PERFORM pg_advisory_unlock(47);
        RAISE;
    END;
END;
$$;
$aa$);
---
-- WRITE CHANGES ABOVE ^^
-- IMPORTANT: update apply_change number at the end of postgres-new.sql
-- to match the number used in the last change here!
-- Also update SqaleUtils.CURRENT_SCHEMA_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java

```

## /Users/ddonahoe/code/midpoint/local-env/scripts/generateUsers.py

```typescript
#!/usr/bin/env python3

import csv
import sys
import random
import datetime

from pathlib import Path

# Check and install required packages
try:
    from faker import Faker
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Faker"])
    from faker import Faker

faker = Faker()

# Registry of user types and their starting UID
UID_REGISTRY = {
    "employee": 1000000,
    "student": 2000000,
    "user_in_role": 3000000
}

# Registry of departments and their department numbers
DEPARTMENTS = {
    "042920": "Controller-Payroll",
    "045200": "Central - Human Resources",
    "052601": "Finance Admin Projects",
    "065602": "Middleware",
    "066103": "Middleware Identity Services"
}

# Registry to keep track of generated identifiers so we can ensure they are unique
generated_ids = set()

# Generate UID
def generate_uid(user_type, in_role=False):
    """Generates a unique user ID based on the user type."""
    if in_role and user_type == "employee":
        user_type = "user_in_role"
    if user_type not in UID_REGISTRY:
        raise ValueError(f"Invalid user type: {user_type}")
    uid = UID_REGISTRY[user_type]
    UID_REGISTRY[user_type] += 1
    return uid

# Generate authId/uupid
def generate_auth_id(first_name, last_name):
    """Generates a unique authentication ID based on the user's first and last name."""
    auth_id = first_name[0].lower() + last_name.lower() + str(len(generated_ids))
    generated_ids.add(auth_id)
    return auth_id

# Add users in "role"
def add_users_in_role():
    """Adds specific users with predefined roles to the user data list."""
    user_data_list = []
    person_admin = "padmin"
    person_contact = "pcontact"
    # User 1: Person Administrator
    user_data_list.append({
        "authId": person_admin,
        "cn": "Person Administrator",
        "creationDate": faker.date_time_this_decade().strftime("%Y-%m-%dT%H:%M:%S"),
        "department": DEPARTMENTS.get("066103"),
        "departmentNumber": "066103",
        "firstName": "Person",
        "givenName": "Person",
        "lastName": "Administrator",
        "telephoneNumber": "5405550001",
        "type": "employee",
        "uid": generate_uid("employee", in_role=True),
        "uupid": person_admin,
        "virginiaTechAffiliation": ["VT-ACTIVE-MEMBER", "VT-EMPLOYEE-STATE", "VT-STAFF"]
    })

    # User 2: Person Contact
    user_data_list.append({
        "authId": person_contact,
        "cn": "Person Contact",
        "creationDate": faker.date_time_this_decade().strftime("%Y-%m-%dT%H:%M:%S"),
        "department": DEPARTMENTS.get("066103"),
        "departmentNumber": "066103",
        "firstName": "Person",
        "givenName": "Person",
        "lastName": "Contact",
        "telephoneNumber": "5405550002",
        "type": "employee",
        "uid": generate_uid("employee", in_role=True),
        "uupid": person_contact,
        "virginiaTechAffiliation": ["VT-ACTIVE-MEMBER", "VT-EMPLOYEE-STATE", "VT-STAFF"]
    })
    return user_data_list

# Generate user
def generate_user(user_type):
    """Generates a user dictionary with user data based on the user type."""
    uid = generate_uid(user_type)
    affiliations = ["VT-ACTIVE-MEMBER"]
    first_name = faker.first_name()
    last_name = faker.last_name()
    auth_id = generate_auth_id(first_name, last_name)
    telephone_number = "540555" + str(random.randint(0, 9999)).zfill(4)
    user_data = {
      "uid": uid,
      "firstName": first_name,
      "lastName": last_name,
      "givenName": first_name,
      "cn": f"{first_name} {last_name}",
      "authId": auth_id,
      "uupid": auth_id,
      "telephoneNumber": telephone_number,
      "creationDate": faker.date_time_this_decade().strftime("%Y-%m-%dT%H:%M:%S"),
      "type": user_type,
      "virginiaTechAffiliation": affiliations
    }

    if user_type == "employee":
      affiliations.extend(["VT-EMPLOYEE-STATE", random.choice(["VT-FACULTY", "VT-STAFF"])])
      department_number, department = random.choice(list(DEPARTMENTS.items()))
      user_data.update({
        "department": department,
        "departmentNumber": department_number
      })
    elif user_type == "student":
      affiliations.extend(["VT-STUDENT", random.choice(["VT-STUDENT-ENROLLED", "VT-STUDENT-FUTURE", "VT-STUDENT-RECENT"])])

    return user_data

# Save user data to CSV file. This is for the developer's reference.
def write_csv(user_data_list, filename='user-data.csv'):
    # Specifying the fieldnames for the CSV file
    fieldnames = user_data_list[0].keys()

    # Creating and writing to the CSV file
    with open(filename, mode='w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for user_data in user_data_list:
            # Converting list values to string to prevent write errors
            for key, value in user_data.items():
                if isinstance(value, list):
                    user_data[key] = ', '.join(value)
            writer.writerow(user_data)

# Save the list of users' usernames (i.e. auth_id) to a text file
def write_list(user_data_list, filename='user-list.txt'):
    with open(filename, mode='w', newline='', encoding='utf-8') as f:
        for user_data in user_data_list:
            f.write(user_data['authId'])
            f.write('\n')

# Write LDIF file
def write_ldif(user_data_list, filename='person-init.ldif'):
    with open(filename, "w") as f:
        for user in sorted(user_data_list, key=lambda x: x["type"]):  # Sort to have employees first
            f.write(f"dn: uid={user['uid']},ou=People,dc=vt,dc=edu\n")
            f.write(f"authId: {user['authId']}\n")
            f.write(f"cn: {user['cn']}\n")
            f.write(f"creationDate: {user['creationDate']}\n")
            if user["type"] == "employee":
                f.write(f"department: {user['department']}\n")
                f.write(f"departmentNumber: {user['departmentNumber']}\n")
            f.write(f"eduPersonPrimaryAffiliation: AFFILIATE\n")
            f.write(f"eduPersonPrincipalName: {user['authId']}@test-vt.edu\n")
            f.write(f"givenName: {user['firstName']}\n")
            f.write("objectClass: virginiaTechPerson\n")
            f.write("objectClass: eduPerson\n")
            f.write("personType: Virginia Tech\n")
            f.write(f"sn: {user['lastName']}\n")
            f.write(f"telephoneNumber: {user['telephoneNumber']}\n")
            f.write(f"uid: {user['uid']}\n")
            f.write(f"uupid: {user['authId']}\n")
            for affiliation in user['virginiaTechAffiliation']:
                f.write(f"virginiaTechAffiliation: {affiliation}\n")
            f.write("\n")  # Separate entries with a newline

# Write SQL file
def write_sql(user_data_list, filename='10-persons.sql'):
    identifier_seqno = 5000000
    person_seqno = 6000000
    account_seqno = 7000000
    transition_seqno = 8000000
    user_affiliation_seqno = 9000000

    with open(filename, 'w') as f:
        for user_data in user_data_list:
            # Add a comment indicating which user is being added
            f.write(f"-- Adding user: {user_data['uupid']} (UID: {user_data['uid']})\n")
            sql_statements = convert_user_data_to_sql(
                user_data, identifier_seqno, person_seqno,
                account_seqno, transition_seqno, user_affiliation_seqno
            )
            for sql in sql_statements:
                f.write(sql + "\n")
            # Add an additional newline after each user's entry
            f.write("\n")
            identifier_seqno += 1
            person_seqno += 1
            account_seqno += 1
            transition_seqno += 1
            user_affiliation_seqno += len(user_data.get('virginiaTechAffiliation', []))

# Convert user data to SQL statements
def convert_user_data_to_sql(user_data, identifier_seqno, person_seqno, account_seqno, transition_seqno, user_affiliation_seqno):
    current_datetime = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    uid = user_data['uid']
    uupid = user_data['uupid']
    first_name = user_data['givenName']
    last_name = user_data['lastName']
    display_name = user_data['cn']
    creation_date = user_data['creationDate']
    virginiaTechAffiliations = user_data.get('virginiaTechAffiliation', [])

    sql_statements = []

    # SQL for person table
    person_sql = f"""
    INSERT INTO person (
        id, first_name, last_name, display_name, gender, deceased, 
        employee_confidential, student_confidential, suppress_all, 
        created_by, created_date, version
    ) 
    VALUES (
        {person_seqno}, '{first_name}', '{last_name}', '{display_name}', 
        'UNREPORTED', false, false, false, 
        false, 'deploy', '{creation_date}', 1
    );
    """
    sql_statements.append(person_sql)

    # SQL for identifier table
    identifier_sql = f"""
    INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version)
    VALUES ({identifier_seqno}, 'USERNAME', '{uupid}', 'deploy', '{current_datetime}', 1);
    """
    sql_statements.append(identifier_sql)

    # SQL for person_to_identifier table
    person_to_identifier_sql = f"""
    INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES ({person_seqno}, {identifier_seqno});
    """
    sql_statements.append(person_to_identifier_sql)

    # SQL for subject table
    subject_sql = f"""
    INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version)
    VALUES ({uid}, 'USER', 'VT', '{uupid}', 'HIGH', 'deploy', '{current_datetime}', 1);
    """
    sql_statements.append(subject_sql)

    # SQL for user_ table
    user_sql = f"""
    INSERT INTO user_ (id, person_id) VALUES ({uid}, {person_seqno});
    """
    sql_statements.append(user_sql)

    # SQL for user_affiliation table
    for affiliation in virginiaTechAffiliations:
        affiliation_snake_case = affiliation.replace('-', '_')
        user_affiliation_sql = f"""
        INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) 
        VALUES ({user_affiliation_seqno}, {uid}, '{affiliation_snake_case}', 'deploy', '{current_datetime}', 1);
        """
        sql_statements.append(user_affiliation_sql)
        user_affiliation_seqno += 1

    # SQL for account table
    account_sql = f"""
    INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) 
    VALUES ({account_seqno}, {uid}, '{uupid}', 'ACTIVE', false, 'deploy', '{current_datetime}', 1);
    """
    sql_statements.append(account_sql)

    # SQL for account_to_identifier table
    account_to_identifier_sql = f"""
    INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES ({account_seqno}, {identifier_seqno});
    """
    sql_statements.append(account_to_identifier_sql)

    # SQL for transition table
    past_datetime = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
    transition_sql = f"""
    INSERT INTO transition (seqno, date, type, created_by, created_date, version)
    VALUES ({transition_seqno}, '{past_datetime}', 'CREATED', 'deploy', '{current_datetime}', 1);
    """
    sql_statements.append(transition_sql)

    # SQL for account_to_prev_transition table
    account_to_prev_transition_sql = f"""
    INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES ({account_seqno}, {transition_seqno});
    """
    sql_statements.append(account_to_prev_transition_sql)

    return sql_statements

# Run the script
if __name__ == "__main__":
    num_users = 100
    root_dir = Path(__file__).parent.parent
    # Try parsing the number of users from command line arguments, if provided
    if len(sys.argv) > 1:
        try:
            num_users = int(sys.argv[1])
        except ValueError:
            print("Invalid number of users. Using default value of 100.")

    print(f"Generating {num_users} users...")

    # Add "role" users - Admins, Contacts, etc...
    user_data_list = add_users_in_role()
    # Calculate number of employees and students to generate
    employees = num_users // 2
    students = num_users - employees

    for _ in range(employees):
        user_data_list.append(generate_user("employee"))
    for _ in range(students):
        user_data_list.append(generate_user("student"))

    ldif_path = f"{root_dir}/src/test/docker/edldap/data/person-init.ldif"
    print("Writing LDIF file to", ldif_path)
    write_ldif(user_data_list, ldif_path)
    sql_path = f"{root_dir}/src/test/docker/registry/scripts/10-persons.sql"
    print("Writing SQL file to", sql_path)
    write_sql(user_data_list, sql_path)
    list_path = f"{root_dir}/src/test/docker/test-driver/user-list.txt"
    print("Writing list of users to", list_path)
    write_list(user_data_list, list_path)
    csv_path = f"{root_dir}/user-data.csv"
    print("Writing CSV file to", csv_path)
    write_csv(user_data_list, csv_path)

```

## /Users/ddonahoe/code/midpoint/local-env/scripts/update-sql-scripts.sh

```typescript
#!/bin/bash
# Updates the MidPoint database scripts in the database folder from a MidPoint distribution tarball

if [ $# -lt 1 ]; then
  echo "USAGE: $(basename $0) /path/to/midpoint-distribution.tar.gz"
  exit 0
fi
TARBALL="$1"
if [[ "$TARBALL" =~ midpoint-([0-9.]+)-dist\.* ]]; then
  VERSION=${BASH_REMATCH[1]}
else
  read -p "Please identify the midpoint version" VERSION
fi
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
TMPDIR="${TMPDIR:-/tmp}"
tar -C $TMPDIR -zxvf "$TARBALL"
EXTRACT_DIR="$TMPDIR/midpoint-$VERSION"
TARGET_DIR="$SCRIPT_DIR/../src/test/docker/database/scripts"
cp -v "$EXTRACT_DIR/doc/config/sql/native/postgres.sql" "$TARGET_DIR"/02-midpoint.sql
cp -v "$EXTRACT_DIR/doc/config/sql/native/postgres-audit.sql" "$TARGET_DIR"/03-audit.sql
cp -v "$EXTRACT_DIR/doc/config/sql/native/postgres-quartz.sql" "$TARGET_DIR"/04-quartz.sql
rm -fR $EXTRACT_DIR
```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/compose.yaml

```typescript
services:
#  # ED-WS Vault instance
#  vault:
#    build: ./vault
#    container_name: vault
#    ports:
#      - "8200:8200"
#    networks:
#      - backend
#    environment:
#      VAULT_ADDR: http://127.0.0.1:8200
#      VAULT_DEV_ROOT_TOKEN_ID: 00000000-0000-0000-0000-000000000000
#    cap_add:
#      - IPC_LOCK
#    healthcheck:
#      test: ["CMD-SHELL", "vault login -no-print token=00000000-0000-0000-0000-000000000000 > /dev/null && (vault kv get dit.middleware/ed-iam/local | grep -c '====== Metadata ======') || exit 1"]
#      interval: 5s
#      timeout: 5s
#      retries: 30
#
## ED WS instance
#  ed-iam-ws:
#    image: code.vt.edu:5005/middleware/ed-iam/ed-ws:latest
#    container_name: ed-iam-ws
#    depends_on:
#      registry:
#        condition: service_healthy
#      edldap-docker:
#        condition: service_started
#      vault:
#        condition: service_healthy
#    ports:
#      - "8443:8443"
#      - "5005:5005"
#    networks:
#      - backend
#    environment:
#      ENV: local
#      CONTAINER_MEM: 1024
#      LOGDIR: /apps/logs
#      SPRING_CLOUD_VAULT_TOKEN: 00000000-0000-0000-0000-000000000000
#      REGISTRY_DATASOURCE_USERNAME: ed
#      REGISTRY_DATASOURCE_URL: jdbc:postgresql://registry:5464/registry?sslmode=disable
#      ED_WS_PEOPLESEARCH_EDLITE-LDAP-CONFIG_URL: ldap://edldap-docker:10389
#      ED_SECURITY_PROVIDER_PERSON-ED-AUTH-CONFIG_URL: ldap://edldap-docker:10389
#      ED_SECURITY_PROVIDER_SERVICE-ED-AUTH-CONFIG_URL: ldap://edldap-docker:10389
#      ED_SERVICE_REGISTRY-TOKEN-MANAGER_OTP-SEED-SECRET: lsslleblrcrududtfufmbm
#    healthcheck:
#      test: [ "CMD-SHELL", "curl --insecure --silent --fail --head https://localhost:8443/ || exit 1" ]
#      start_period: 10s
#      interval: 20s
#      timeout: 5s
#      retries: 90

  registry:
    image: code.vt.edu:5005/middleware/ed-iam/registry:latest
    platform: linux/amd64
    container_name: registry
    environment:
      POSTGRES_USER: "registry"
      POSTGRES_PASSWORD: "go2VajanyaTek"
      POSTGRES_DB: "registry"
      ED_PASSWORD: "go2VajanyaTek"
    volumes:
      - ./registry/scripts/10-persons.sql:/docker-entrypoint-initdb.d/10-persons.sql
      - ./registry/scripts/20-midpoint-service.sql:/docker-entrypoint-initdb.d/20-midpoint-service.sql
    ports:
      - "5464:5464"
    networks:
      - backend
    command: -p 5464
    healthcheck:
      test: [ "CMD-SHELL", "PGPASSWORD=go2VajanyaTek psql -U ed -h registry -d registry -p 5464 -c 'SELECT 1;' >/dev/null 2>&1" ]
      interval: 5s
      timeout: 5s
      retries: 30

  # ED LDAP instance
  edldap-docker:
    image: code.vt.edu:5005/middleware/edldap-deploy-env
    platform: linux/amd64
    container_name: edldap-docker
    environment:
      DEBUG: "-d 256"
    volumes:
      - ./edldap/data:/apps/local/ldif
      - ./midpoint/certs/midpoint.pem:/apps/local/openldap/etc/openldap/ed-ldap-cachain.pem
    ports:
      - "10389:10389"
    networks:
      - backend

  # midPoint datasource
  midpoint-db:
    image: postgres:16.0-alpine
    command: postgres -c shared_buffers=256MB -c fsync=off
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - backend
    environment:
      POSTGRES_USER: "midpoint"
      POSTGRES_PASSWORD: "go2VajanyaTek"
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - type: bind
        source: ./database/scripts
        target: /docker-entrypoint-initdb.d
        read_only: true
      - type: tmpfs
        target: /var/lib/postgresql/data
    healthcheck:
      test: [ "CMD-SHELL", "PGPASSWORD=go2VajanyaTek psql -U midpoint -h localhost -d postgres -p 5432 -c 'SELECT 1;' >/dev/null 2>&1" ]
      interval: 5s
      timeout: 5s
      retries: 30

  midpoint:
    build: ../../docker/target
    depends_on:
      midpoint-db:
        condition: service_healthy
      registry:
        condition: service_healthy
      edldap-docker:
        condition: service_started
    networks:
      - frontend
      - backend
    environment:
      ENV: local
      CONTAINER_MEM: 2048
      JAVA_HEAP_PERCENT: 80
      JAVA_OPTS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:15005 -Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts -Djavax.net.ssl.trustStoreType=jks"
      MP_UNSET_midpoint_repository_hibernateHbm2ddl: "1"
      MP_SET_midpoint_logging_alt_enabled: "true"
      MP_NO_ENV_COMPAT: "1"
      OIDC_CLIENT_SECRET: "$OIDC_CLIENT_SECRET"
      GROUPER_DB_HOST: ""
      GROUPER_DB_PORT: ""
      GROUPER_DB_NAME: ""
      ED_LDAP: "edldap-docker:10389"
      AD_LDAP: ""
      AD_BIND_DN: ""
      AD_BASE_DN: ""
      AD_BASE_DN_OUTBOUND: ""

    ports:
      - "127.0.0.1:15005:15005"
      - "127.0.0.1:8443:8443"
    volumes:
      - ./data:/opt/midpoint/tmp
      - ./midpoint/certs/midpoint.p12:/opt/midpoint/var/midpoint.p12
      - ./edldap/certs/edldap-truststore.jks:/opt/midpoint/var/incommon-truststore.jks

networks:
  frontend:
  backend:


```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/database/scripts/01-init.sql

```typescript
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS midpoint;
CREATE EXTENSION IF NOT EXISTS intarray; -- support for indexing INTEGER[] columns
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- support for trigram indexes
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch; -- fuzzy string match (levenshtein, etc.)
```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/database/scripts/02-midpoint.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- Naming conventions:
-- M_ prefix is used for tables in main part of the repo, MA_ for audit tables (can be separate)
-- Constraints/indexes use table_column(s)_suffix convention, with PK for primary key,
-- FK foreign key, IDX for index, KEY for unique index.
-- TR is suffix for triggers.
-- Names are generally lowercase (despite prefix/suffixes above in uppercase ;-)).
-- Column names are Java style and match attribute names from M-classes (e.g. MObject).
--
-- Other notes:
-- TEXT is used instead of VARCHAR, see: https://dba.stackexchange.com/a/21496/157622
-- We prefer "CREATE UNIQUE INDEX" to "ALTER TABLE ... ADD CONSTRAINT", unless the column
-- is marked as UNIQUE directly - then the index is implied, don't create it explicitly.
--
-- For Audit tables see 'postgres-new-audit.sql' right next to this file.
-- For Quartz tables see 'postgres-new-quartz.sql'.

-- noinspection SqlResolveForFile @ operator-class/"gin__int_ops"

-- just in case PUBLIC schema was dropped (fastest way to remove all midpoint objects)
-- drop schema public cascade;
CREATE SCHEMA IF NOT EXISTS public;
CREATE EXTENSION IF NOT EXISTS intarray; -- support for indexing INTEGER[] columns
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- support for trigram indexes
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch; -- fuzzy string match (levenshtein, etc.)

-- region custom enum types
-- Some enums are from schema, some are only defined in repo-sqale.
-- All Java enum types must be registered in SqaleRepoContext constructor.

-- First purely repo-sqale enums (these have M prefix in Java, the rest of the name is the same):
CREATE TYPE ContainerType AS ENUM (
    'ACCESS_CERTIFICATION_CASE',
    'ACCESS_CERTIFICATION_WORK_ITEM',
    'AFFECTED_OBJECTS',
    'ASSIGNMENT',
    'CASE_WORK_ITEM',
    'FOCUS_IDENTITY',
    'INDUCEMENT',
    'LOOKUP_TABLE_ROW',
    'OPERATION_EXECUTION',
    'SIMULATION_RESULT_PROCESSED_OBJECT',
    'TRIGGER');

-- NOTE: Keep in sync with the same enum in postgres-new-audit.sql!
CREATE TYPE ObjectType AS ENUM (
    'ABSTRACT_ROLE',
    'ACCESS_CERTIFICATION_CAMPAIGN',
    'ACCESS_CERTIFICATION_DEFINITION',
    'ARCHETYPE',
    'ASSIGNMENT_HOLDER',
    'CASE',
    'CONNECTOR',
    'CONNECTOR_HOST',
    'DASHBOARD',
    'FOCUS',
    'FORM',
    'FUNCTION_LIBRARY',
    'GENERIC_OBJECT',
    'LOOKUP_TABLE',
    'MARK',
    'MESSAGE_TEMPLATE',
    'NODE',
    'OBJECT',
    'OBJECT_COLLECTION',
    'OBJECT_TEMPLATE',
    'ORG',
    'REPORT',
    'REPORT_DATA',
    'RESOURCE',
    'ROLE',
    'ROLE_ANALYSIS_CLUSTER',
    'ROLE_ANALYSIS_SESSION',
    'SECURITY_POLICY',
    'SEQUENCE',
    'SERVICE',
    'SHADOW',
    'SIMULATION_RESULT',
    'SYSTEM_CONFIGURATION',
    'TASK',
    'USER',
    'VALUE_POLICY');

CREATE TYPE ReferenceType AS ENUM (
    'ARCHETYPE',
    'ASSIGNMENT_CREATE_APPROVER',
    'ASSIGNMENT_MODIFY_APPROVER',
    'ACCESS_CERT_WI_ASSIGNEE',
    'ACCESS_CERT_WI_CANDIDATE',
    'CASE_WI_ASSIGNEE',
    'CASE_WI_CANDIDATE',
    'DELEGATED',
    'INCLUDE',
    'OBJECT_CREATE_APPROVER',
    'OBJECT_EFFECTIVE_MARK',
    'OBJECT_MODIFY_APPROVER',
    'OBJECT_PARENT_ORG',
    'PERSONA',
    'PROCESSED_OBJECT_EVENT_MARK',
    'PROJECTION',
    'RESOURCE_BUSINESS_CONFIGURATION_APPROVER',
    'ROLE_MEMBERSHIP');

CREATE TYPE ExtItemHolderType AS ENUM (
    'EXTENSION',
    'ATTRIBUTES');

CREATE TYPE ExtItemCardinality AS ENUM (
    'SCALAR',
    'ARRAY');

-- Schema based enums have the same name like their enum classes (I like the Type suffix here):
CREATE TYPE AccessCertificationCampaignStateType AS ENUM (
    'CREATED', 'IN_REVIEW_STAGE', 'REVIEW_STAGE_DONE', 'IN_REMEDIATION', 'CLOSED');

CREATE TYPE ActivationStatusType AS ENUM ('ENABLED', 'DISABLED', 'ARCHIVED');

CREATE TYPE AdministrativeAvailabilityStatusType AS ENUM ('MAINTENANCE', 'OPERATIONAL');

CREATE TYPE AvailabilityStatusType AS ENUM ('DOWN', 'UP', 'BROKEN');

CREATE TYPE CorrelationSituationType AS ENUM ('UNCERTAIN', 'EXISTING_OWNER', 'NO_OWNER', 'ERROR');

CREATE TYPE ExecutionModeType AS ENUM ('FULL', 'PREVIEW', 'SHADOW_MANAGEMENT_PREVIEW', 'DRY_RUN', 'NONE', 'BUCKET_ANALYSIS');

CREATE TYPE LockoutStatusType AS ENUM ('NORMAL', 'LOCKED');

CREATE TYPE NodeOperationalStateType AS ENUM ('UP', 'DOWN', 'STARTING');

CREATE TYPE OperationExecutionRecordTypeType AS ENUM ('SIMPLE', 'COMPLEX');

-- NOTE: Keep in sync with the same enum in postgres-new-audit.sql!
CREATE TYPE OperationResultStatusType AS ENUM ('SUCCESS', 'WARNING', 'PARTIAL_ERROR',
    'FATAL_ERROR', 'HANDLED_ERROR', 'NOT_APPLICABLE', 'IN_PROGRESS', 'UNKNOWN');

CREATE TYPE OrientationType AS ENUM ('PORTRAIT', 'LANDSCAPE');

CREATE TYPE PredefinedConfigurationType AS ENUM ( 'PRODUCTION', 'DEVELOPMENT' );

CREATE TYPE ResourceAdministrativeStateType AS ENUM ('ENABLED', 'DISABLED');

CREATE TYPE ShadowKindType AS ENUM ('ACCOUNT', 'ENTITLEMENT', 'GENERIC', 'UNKNOWN');

CREATE TYPE SynchronizationSituationType AS ENUM (
    'DELETED', 'DISPUTED', 'LINKED', 'UNLINKED', 'UNMATCHED');

CREATE TYPE TaskAutoScalingModeType AS ENUM ('DISABLED', 'DEFAULT');

CREATE TYPE TaskBindingType AS ENUM ('LOOSE', 'TIGHT');

CREATE TYPE TaskExecutionStateType AS ENUM ('RUNNING', 'RUNNABLE', 'WAITING', 'SUSPENDED', 'CLOSED');

CREATE TYPE TaskRecurrenceType AS ENUM ('SINGLE', 'RECURRING');

CREATE TYPE TaskSchedulingStateType AS ENUM ('READY', 'WAITING', 'SUSPENDED', 'CLOSED');

CREATE TYPE TaskWaitingReasonType AS ENUM ('OTHER_TASKS', 'OTHER');

CREATE TYPE ThreadStopActionType AS ENUM ('RESTART', 'RESCHEDULE', 'SUSPEND', 'CLOSE');

CREATE TYPE TimeIntervalStatusType AS ENUM ('BEFORE', 'IN', 'AFTER');
-- endregion

-- region OID-pool table
-- To support gen_random_uuid() pgcrypto extension must be enabled for the database (not for PG 13).
-- select * from pg_available_extensions order by name;
DO $$
BEGIN
    PERFORM pg_get_functiondef('gen_random_uuid()'::regprocedure);
    RAISE NOTICE 'gen_random_uuid already exists, skipping create EXTENSION pgcrypto';
EXCEPTION WHEN undefined_function THEN
    CREATE EXTENSION pgcrypto;
END
$$;

-- "OID pool", provides generated OID, can be referenced by FKs.
CREATE TABLE m_object_oid (
    oid UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
-- endregion

-- region Functions/triggers
-- BEFORE INSERT trigger - must be declared on all concrete m_object sub-tables.
CREATE OR REPLACE FUNCTION insert_object_oid()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.oid IS NOT NULL THEN
        INSERT INTO m_object_oid VALUES (NEW.oid);
    ELSE
        INSERT INTO m_object_oid DEFAULT VALUES RETURNING oid INTO NEW.oid;
    END IF;
    -- before trigger must return NEW row to do something
    RETURN NEW;
END
$$;

-- AFTER DELETE trigger - must be declared on all concrete m_object sub-tables.
CREATE OR REPLACE FUNCTION delete_object_oid()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    delete from m_object_oid where oid = OLD.oid;
    -- after trigger returns null
    RETURN NULL;
END
$$;

-- BEFORE UPDATE trigger - must be declared on all concrete m_object sub-tables.
-- Checks that OID is not changed and updates db_modified column.
CREATE OR REPLACE FUNCTION before_update_object()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.oid = OLD.oid THEN
        NEW.db_modified = current_timestamp;
        -- must return NEW, NULL would skip the update
        RETURN NEW;
    END IF;

    -- OID changed, forbidden
    RAISE EXCEPTION 'UPDATE on "%" tried to change OID "%" to "%". OID is immutable and cannot be changed.',
        TG_TABLE_NAME, OLD.oid, NEW.oid;
END
$$;
-- endregion

-- region Enumeration/code/management tables
-- Key -> value config table for internal use.
CREATE TABLE m_global_metadata (
    name TEXT PRIMARY KEY,
    value TEXT
);

-- Catalog of often used URIs, typically channels and relation Q-names.
-- Never update values of "uri" manually to change URI for some objects
-- (unless you really want to migrate old URI to a new one).
-- URI can be anything, for QNames the format is based on QNameUtil ("prefix-url#localPart").
CREATE TABLE m_uri (
    id SERIAL NOT NULL PRIMARY KEY,
    uri TEXT NOT NULL UNIQUE
);

-- There can be more constants pre-filled, but that adds overhead, let the first-start do it.
-- Nothing in the application code should rely on anything inserted here, not even for 0=default.
-- Pinning 0 to default relation is merely for convenience when reading the DB tables.
INSERT INTO m_uri (id, uri)
    VALUES (0, 'http://midpoint.evolveum.com/xml/ns/public/common/org-3#default');
-- endregion

-- region for abstract tables m_object/container/reference
-- Purely abstract table (no entries are allowed). Represents ObjectType+ArchetypeHolderType.
-- See https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/objecttype/
-- Following is recommended for each concrete table (see m_resource for example):
-- 1) override OID like this (PK+FK): oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
-- 2) define object type class (change value as needed):
--   objectType ObjectType GENERATED ALWAYS AS ('XY') STORED CHECK (objectType = 'XY'),
--   The CHECK part helps with query optimization when the column is uses in WHERE.
-- 3) add three triggers <table_name>_oid_{insert|update|delete}_tr
-- 4) add indexes for nameOrig and nameNorm columns (nameNorm as unique)
-- 5) the rest varies on the concrete table, other indexes or constraints, etc.
-- 6) any required FK must be created on the concrete table, even for inherited columns
CREATE TABLE m_object (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    oid UUID NOT NULL,
    -- objectType will be overridden with GENERATED value in concrete table
    -- CHECK helps optimizer to avoid this table when different type is asked, mind that
    -- WHERE objectType = 'OBJECT' never returns anything (unlike select * from m_object).
    -- We don't want this check to be inherited as it would prevent any inserts of other types.

    -- PG16: ObjectType column will be added later, it needs to have different definition for PG < 16 and PG >= 16
    -- and it is not possible to achieve that definition with ALTER COLUMN statement
    -- objectType ObjectType NOT NULL CHECK (objectType = 'OBJECT') NO INHERIT,
    nameOrig TEXT NOT NULL,
    nameNorm TEXT NOT NULL,
    fullObject BYTEA,
    tenantRefTargetOid UUID,
    tenantRefTargetType ObjectType,
    tenantRefRelationId INTEGER REFERENCES m_uri(id),
    lifecycleState TEXT, -- TODO what is this? how many distinct values?
    cidSeq BIGINT NOT NULL DEFAULT 1, -- sequence for container id, next free cid
    version INTEGER NOT NULL DEFAULT 1,
    -- complex DB columns, add indexes as needed per concrete table, e.g. see m_user
    -- TODO compare with [] in JSONB, check performance, indexing, etc. first
    policySituations INTEGER[], -- soft-references m_uri, only EQ filter
    subtypes TEXT[], -- only EQ filter
    fullTextInfo TEXT,
    /*
    Extension items are stored as JSON key:value pairs, where key is m_ext_item.id (as string)
    and values are stored as follows (this is internal and has no effect on how query is written):
    - string and boolean are stored as-is
    - any numeric type integral/float/precise is stored as NUMERIC (JSONB can store that)
    - enum as toString() or name() of the Java enum instance
    - date-time as Instant.toString() ISO-8601 long date-timeZ (UTC), cut to 3 fraction digits
    - poly-string is stored as sub-object {"o":"orig-value","n":"norm-value"}
    - reference is stored as sub-object {"o":"oid","t":"targetType","r":"relationId"}
    - - where targetType is ObjectType and relationId is from m_uri.id, just like for ref columns
    */
    ext JSONB,
    -- metadata
    creatorRefTargetOid UUID,
    creatorRefTargetType ObjectType,
    creatorRefRelationId INTEGER REFERENCES m_uri(id),
    createChannelId INTEGER REFERENCES m_uri(id),
    createTimestamp TIMESTAMPTZ,
    modifierRefTargetOid UUID,
    modifierRefTargetType ObjectType,
    modifierRefRelationId INTEGER REFERENCES m_uri(id),
    modifyChannelId INTEGER REFERENCES m_uri(id),
    modifyTimestamp TIMESTAMPTZ,

    -- these are purely DB-managed metadata, not mapped to in midPoint
    db_created TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    db_modified TIMESTAMPTZ NOT NULL DEFAULT current_timestamp, -- updated in update trigger

    -- prevents inserts to this table, but not to inherited ones; this makes it "abstract" table
    CHECK (FALSE) NO INHERIT
);




-- Important objectType column needs to be non-generated on PG < 16 and generated on PG>=16
--
-- Before Postgres 16: if parent column was generated, child columns must use same value
-- After 16: Parent must be generated, if children are generated, they may have different generation values
do $$
declare
  pg16 int;
begin

-- Are we on Posgres 16 or newer? we cannot use VERSION() since it returns formated string
SELECT 1 FROM "pg_settings" into pg16 WHERE "name" = 'server_version_num' AND "setting" >= '160000';
  if pg16 then
       ALTER TABLE m_object ADD COLUMN objectType ObjectType GENERATED ALWAYS AS ('OBJECT') STORED NOT NULL CHECK (objectType = 'OBJECT') NO INHERIT;
    else
       -- PG 15 and lower
       ALTER TABLE m_object ADD COLUMN objectType ObjectType NOT NULL CHECK (objectType = 'OBJECT') NO INHERIT;
  end if;
end $$;




-- No indexes here, always add indexes and referential constraints on concrete sub-tables.

-- Represents AssignmentHolderType (all objects except shadows)
-- extending m_object, but still abstract, hence the CHECK (false)
CREATE TABLE m_assignment_holder (
    -- objectType will be overridden with GENERATED value in concrete table
    objectType ObjectType NOT NULL CHECK (objectType = 'ASSIGNMENT_HOLDER') NO INHERIT,

    CHECK (FALSE) NO INHERIT
)
    INHERITS (m_object);

-- Purely abstract table (no entries are allowed). Represents Containerable/PrismContainerValue.
-- Allows querying all separately persisted containers, but not necessary for the application.
CREATE TABLE m_container (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    -- Owner does not have to be the direct parent of the container.
    ownerOid UUID NOT NULL,
    -- use like this on the concrete table:
    -- ownerOid UUID NOT NULL REFERENCES m_object_oid(oid),

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    -- containerType will be overridden with GENERATED value in concrete table
    -- containerType will be added by ALTER because we need different definition between PG Versions
    -- containerType ContainerType NOT NULL,

    CHECK (FALSE) NO INHERIT
    -- add on concrete table (additional columns possible): PRIMARY KEY (ownerOid, cid)
);
-- Abstract reference table, for object but also other container references.
CREATE TABLE m_reference (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    ownerType ObjectType NOT NULL,
    -- referenceType will be overridden with GENERATED value in concrete table
    -- referenceType will be added by ALTER because we need different definition between PG Versions

    targetOid UUID NOT NULL, -- soft-references m_object
    targetType ObjectType NOT NULL,
    relationId INTEGER NOT NULL REFERENCES m_uri(id),

    -- prevents inserts to this table, but not to inherited ones; this makes it "abstract" table
    CHECK (FALSE) NO INHERIT
    -- add PK (referenceType is the same per table): PRIMARY KEY (ownerOid, relationId, targetOid)
);

-- Important: referenceType, containerType column needs to be non-generated on PG < 16 and generated on PG>=16
--
-- Before Postgres 16: if parent column was generated, child columns must use same value
-- After 16: Parent must be generated, if children are generated, they may have different generation values
do $$
declare
  pg16 int;
begin

-- Are we on Postgres 16 or newer? we cannot use VERSION() since it returns formated string
SELECT 1 FROM "pg_settings" into pg16 WHERE "name" = 'server_version_num' AND "setting" >= '160000';
  if pg16 then
       ALTER TABLE m_reference ADD COLUMN referenceType ReferenceType  GENERATED ALWAYS AS (NULL) STORED NOT NULL;
       ALTER TABLE m_container ADD COLUMN containerType ContainerType  GENERATED ALWAYS AS (NULL) STORED NOT NULL;
    else
       -- PG 15 and lower
       ALTER TABLE m_reference ADD COLUMN referenceType ReferenceType NOT NULL;
       ALTER TABLE m_container ADD COLUMN containerType ContainerType NOT NULL;
  end if;
end $$;

-- Add this index for each sub-table (reference type is not necessary, each sub-table has just one).
-- CREATE INDEX m_reference_targetOidRelationId_idx ON m_reference (targetOid, relationId);


-- references related to ObjectType and AssignmentHolderType
-- stores AssignmentHolderType/archetypeRef
CREATE TABLE m_ref_archetype (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('ARCHETYPE') STORED
        CHECK (referenceType = 'ARCHETYPE'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_archetype_targetOidRelationId_idx
    ON m_ref_archetype (targetOid, relationId);

-- stores AssignmentHolderType/delegatedRef
CREATE TABLE m_ref_delegated (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('DELEGATED') STORED
        CHECK (referenceType = 'DELEGATED'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_delegated_targetOidRelationId_idx
    ON m_ref_delegated (targetOid, relationId);

-- stores ObjectType/metadata/createApproverRef
CREATE TABLE m_ref_object_create_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_CREATE_APPROVER') STORED
        CHECK (referenceType = 'OBJECT_CREATE_APPROVER'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_create_approver_targetOidRelationId_idx
    ON m_ref_object_create_approver (targetOid, relationId);


-- stores ObjectType/effectiveMarkRef
CREATE TABLE m_ref_object_effective_mark (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_EFFECTIVE_MARK') STORED
        CHECK (referenceType = 'OBJECT_EFFECTIVE_MARK'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_effective_mark_targetOidRelationId_idx
    ON m_ref_object_effective_mark (targetOid, relationId);


-- stores ObjectType/metadata/modifyApproverRef
CREATE TABLE m_ref_object_modify_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_MODIFY_APPROVER') STORED
        CHECK (referenceType = 'OBJECT_MODIFY_APPROVER'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_modify_approver_targetOidRelationId_idx
    ON m_ref_object_modify_approver (targetOid, relationId);

-- stores AssignmentHolderType/roleMembershipRef
CREATE TABLE m_ref_role_membership (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('ROLE_MEMBERSHIP') STORED
        CHECK (referenceType = 'ROLE_MEMBERSHIP'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_role_membership_targetOidRelationId_idx
    ON m_ref_role_membership (targetOid, relationId);
-- endregion

-- region FOCUS related tables
-- Represents FocusType (Users, Roles, ...), see https://docs.evolveum.com/midpoint/reference/schema/focus-and-projections/
-- extending m_object, but still abstract, hence the CHECK (false)
CREATE TABLE m_focus (
    -- objectType will be overridden with GENERATED value in concrete table
    objectType ObjectType NOT NULL CHECK (objectType = 'FOCUS') NO INHERIT,
    costCenter TEXT,
    emailAddress TEXT,
    photo BYTEA, -- will be TOAST-ed if necessary
    locale TEXT,
    localityOrig TEXT,
    localityNorm TEXT,
    preferredLanguage TEXT,
    telephoneNumber TEXT,
    timezone TEXT,
    -- credential/password/metadata
    passwordCreateTimestamp TIMESTAMPTZ,
    passwordModifyTimestamp TIMESTAMPTZ,
    -- activation
    administrativeStatus ActivationStatusType,
    effectiveStatus ActivationStatusType,
    enableTimestamp TIMESTAMPTZ,
    disableTimestamp TIMESTAMPTZ,
    disableReason TEXT,
    validityStatus TimeIntervalStatusType,
    validFrom TIMESTAMPTZ,
    validTo TIMESTAMPTZ,
    validityChangeTimestamp TIMESTAMPTZ,
    archiveTimestamp TIMESTAMPTZ,
    lockoutStatus LockoutStatusType,
    normalizedData JSONB,

    CHECK (FALSE) NO INHERIT
)
    INHERITS (m_assignment_holder);

-- for each concrete sub-table indexes must be added, validFrom, validTo, etc.

-- stores FocusType/personaRef
CREATE TABLE m_ref_persona (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('PERSONA') STORED
        CHECK (referenceType = 'PERSONA'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_persona_targetOidRelationId_idx
    ON m_ref_persona (targetOid, relationId);

-- stores FocusType/linkRef ("projection" is newer and better term)
CREATE TABLE m_ref_projection (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('PROJECTION') STORED
        CHECK (referenceType = 'PROJECTION'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_projection_targetOidRelationId_idx
    ON m_ref_projection (targetOid, relationId);

CREATE TABLE m_focus_identity (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('FOCUS_IDENTITY') STORED
        CHECK (containerType = 'FOCUS_IDENTITY'),
    fullObject BYTEA,
    sourceResourceRefTargetOid UUID,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_focus_identity_sourceResourceRefTargetOid_idx ON m_focus_identity (sourceResourceRefTargetOid);

-- Represents GenericObjectType, see https://docs.evolveum.com/midpoint/reference/schema/generic-objects/
CREATE TABLE m_generic_object (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('GENERIC_OBJECT') STORED
        CHECK (objectType = 'GENERIC_OBJECT')
)
    INHERITS (m_focus);

CREATE TRIGGER m_generic_object_oid_insert_tr BEFORE INSERT ON m_generic_object
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_generic_object_update_tr BEFORE UPDATE ON m_generic_object
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_generic_object_oid_delete_tr AFTER DELETE ON m_generic_object
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_generic_object_nameOrig_idx ON m_generic_object (nameOrig);
CREATE UNIQUE INDEX m_generic_object_nameNorm_key ON m_generic_object (nameNorm);
CREATE INDEX m_generic_object_subtypes_idx ON m_generic_object USING gin(subtypes);
CREATE INDEX m_generic_object_validFrom_idx ON m_generic_object (validFrom);
CREATE INDEX m_generic_object_validTo_idx ON m_generic_object (validTo);
CREATE INDEX m_generic_object_fullTextInfo_idx
    ON m_generic_object USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_generic_object_createTimestamp_idx ON m_generic_object (createTimestamp);
CREATE INDEX m_generic_object_modifyTimestamp_idx ON m_generic_object (modifyTimestamp);
-- endregion

-- region USER related tables
-- Represents UserType, see https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/usertype/
CREATE TABLE m_user (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('USER') STORED
        CHECK (objectType = 'USER'),
    additionalNameOrig TEXT,
    additionalNameNorm TEXT,
    employeeNumber TEXT,
    familyNameOrig TEXT,
    familyNameNorm TEXT,
    fullNameOrig TEXT,
    fullNameNorm TEXT,
    givenNameOrig TEXT,
    givenNameNorm TEXT,
    honorificPrefixOrig TEXT,
    honorificPrefixNorm TEXT,
    honorificSuffixOrig TEXT,
    honorificSuffixNorm TEXT,
    nickNameOrig TEXT,
    nickNameNorm TEXT,
    personalNumber TEXT,
    titleOrig TEXT,
    titleNorm TEXT,
    organizations JSONB, -- array of {o,n} objects (poly-strings)
    organizationUnits JSONB -- array of {o,n} objects (poly-strings)
)
    INHERITS (m_focus);

CREATE TRIGGER m_user_oid_insert_tr BEFORE INSERT ON m_user
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_user_update_tr BEFORE UPDATE ON m_user
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_user_oid_delete_tr AFTER DELETE ON m_user
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_user_nameOrig_idx ON m_user (nameOrig);
CREATE UNIQUE INDEX m_user_nameNorm_key ON m_user (nameNorm);
CREATE INDEX m_user_policySituation_idx ON m_user USING gin(policysituations gin__int_ops);
CREATE INDEX m_user_ext_idx ON m_user USING gin(ext);
CREATE INDEX m_user_fullNameOrig_idx ON m_user (fullNameOrig);
CREATE INDEX m_user_familyNameOrig_idx ON m_user (familyNameOrig);
CREATE INDEX m_user_givenNameOrig_idx ON m_user (givenNameOrig);
CREATE INDEX m_user_employeeNumber_idx ON m_user (employeeNumber);
CREATE INDEX m_user_subtypes_idx ON m_user USING gin(subtypes);
CREATE INDEX m_user_organizations_idx ON m_user USING gin(organizations);
CREATE INDEX m_user_organizationUnits_idx ON m_user USING gin(organizationUnits);
CREATE INDEX m_user_validFrom_idx ON m_user (validFrom);
CREATE INDEX m_user_validTo_idx ON m_user (validTo);
CREATE INDEX m_user_fullTextInfo_idx ON m_user USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_user_createTimestamp_idx ON m_user (createTimestamp);
CREATE INDEX m_user_modifyTimestamp_idx ON m_user (modifyTimestamp);
-- endregion

-- region ROLE related tables
-- Represents AbstractRoleType, see https://docs.evolveum.com/midpoint/architecture/concepts/abstract-role/
CREATE TABLE m_abstract_role (
    -- objectType will be overridden with GENERATED value in concrete table
    objectType ObjectType NOT NULL CHECK (objectType = 'ABSTRACT_ROLE') NO INHERIT,
    autoAssignEnabled BOOLEAN,
    displayNameOrig TEXT,
    displayNameNorm TEXT,
    identifier TEXT,
    requestable BOOLEAN,
    riskLevel TEXT,

    CHECK (FALSE) NO INHERIT
)
    INHERITS (m_focus);

/*
TODO: add for sub-tables, role, org... all? how many services?
 identifier is OK (TEXT), but booleans are useless unless used in WHERE
CREATE INDEX iAbstractRoleIdentifier ON m_abstract_role (identifier);
CREATE INDEX iRequestable ON m_abstract_role (requestable);
CREATE INDEX iAutoassignEnabled ON m_abstract_role(autoassign_enabled);
*/

-- Represents RoleType, see https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/roletype/
CREATE TABLE m_role (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE') STORED
        CHECK (objectType = 'ROLE')
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_role_oid_insert_tr BEFORE INSERT ON m_role
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_update_tr BEFORE UPDATE ON m_role
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_oid_delete_tr AFTER DELETE ON m_role
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_role_nameOrig_idx ON m_role (nameOrig);
CREATE UNIQUE INDEX m_role_nameNorm_key ON m_role (nameNorm);
CREATE INDEX m_role_subtypes_idx ON m_role USING gin(subtypes);
CREATE INDEX m_role_identifier_idx ON m_role (identifier);
CREATE INDEX m_role_validFrom_idx ON m_role (validFrom);
CREATE INDEX m_role_validTo_idx ON m_role (validTo);
CREATE INDEX m_role_fullTextInfo_idx ON m_role USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_role_createTimestamp_idx ON m_role (createTimestamp);
CREATE INDEX m_role_modifyTimestamp_idx ON m_role (modifyTimestamp);

-- Represents ServiceType, see https://docs.evolveum.com/midpoint/reference/deployment/service-account-management/
CREATE TABLE m_service (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SERVICE') STORED
        CHECK (objectType = 'SERVICE'),
    displayOrder INTEGER
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_service_oid_insert_tr BEFORE INSERT ON m_service
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_service_update_tr BEFORE UPDATE ON m_service
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_service_oid_delete_tr AFTER DELETE ON m_service
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_service_nameOrig_idx ON m_service (nameOrig);
CREATE UNIQUE INDEX m_service_nameNorm_key ON m_service (nameNorm);
CREATE INDEX m_service_subtypes_idx ON m_service USING gin(subtypes);
CREATE INDEX m_service_identifier_idx ON m_service (identifier);
CREATE INDEX m_service_validFrom_idx ON m_service (validFrom);
CREATE INDEX m_service_validTo_idx ON m_service (validTo);
CREATE INDEX m_service_fullTextInfo_idx ON m_service USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_service_createTimestamp_idx ON m_service (createTimestamp);
CREATE INDEX m_service_modifyTimestamp_idx ON m_service (modifyTimestamp);

-- Represents ArchetypeType, see https://docs.evolveum.com/midpoint/reference/schema/archetypes/
CREATE TABLE m_archetype (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ARCHETYPE') STORED
        CHECK (objectType = 'ARCHETYPE')
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_archetype_oid_insert_tr BEFORE INSERT ON m_archetype
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_archetype_update_tr BEFORE UPDATE ON m_archetype
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_archetype_oid_delete_tr AFTER DELETE ON m_archetype
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_archetype_nameOrig_idx ON m_archetype (nameOrig);
CREATE UNIQUE INDEX m_archetype_nameNorm_key ON m_archetype (nameNorm);
CREATE INDEX m_archetype_subtypes_idx ON m_archetype USING gin(subtypes);
CREATE INDEX m_archetype_identifier_idx ON m_archetype (identifier);
CREATE INDEX m_archetype_validFrom_idx ON m_archetype (validFrom);
CREATE INDEX m_archetype_validTo_idx ON m_archetype (validTo);
CREATE INDEX m_archetype_fullTextInfo_idx ON m_archetype USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_archetype_createTimestamp_idx ON m_archetype (createTimestamp);
CREATE INDEX m_archetype_modifyTimestamp_idx ON m_archetype (modifyTimestamp);
-- endregion

-- region Organization hierarchy support
-- Represents OrgType, see https://docs.evolveum.com/midpoint/architecture/archive/data-model/midpoint-common-schema/orgtype/
CREATE TABLE m_org (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ORG') STORED
        CHECK (objectType = 'ORG'),
    displayOrder INTEGER,
    tenant BOOLEAN
)
    INHERITS (m_abstract_role);

CREATE TRIGGER m_org_oid_insert_tr BEFORE INSERT ON m_org
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_org_update_tr BEFORE UPDATE ON m_org
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_org_oid_delete_tr AFTER DELETE ON m_org
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_org_nameOrig_idx ON m_org (nameOrig);
CREATE UNIQUE INDEX m_org_nameNorm_key ON m_org (nameNorm);
CREATE INDEX m_org_displayOrder_idx ON m_org (displayOrder);
CREATE INDEX m_org_subtypes_idx ON m_org USING gin(subtypes);
CREATE INDEX m_org_identifier_idx ON m_org (identifier);
CREATE INDEX m_org_validFrom_idx ON m_org (validFrom);
CREATE INDEX m_org_validTo_idx ON m_org (validTo);
CREATE INDEX m_org_fullTextInfo_idx ON m_org USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_org_createTimestamp_idx ON m_org (createTimestamp);
CREATE INDEX m_org_modifyTimestamp_idx ON m_org (modifyTimestamp);

-- stores ObjectType/parentOrgRef
CREATE TABLE m_ref_object_parent_org (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('OBJECT_PARENT_ORG') STORED
        CHECK (referenceType = 'OBJECT_PARENT_ORG'),

    -- TODO wouldn't (ownerOid, targetOid, relationId) perform better for typical queries?
    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_object_parent_org_targetOidRelationId_idx
    ON m_ref_object_parent_org (targetOid, relationId);

-- region org-closure
/*
Trigger on m_ref_object_parent_org marks this view for refresh in one m_global_metadata row.
Closure contains also identity (org = org) entries because:
* It's easier to do optimized matrix-multiplication based refresh with them later.
* It actually makes some query easier and requires AND instead of OR conditions.
* While the table shows that o => o (=> means "is parent of"), this is not the semantics
of isParent/ChildOf searches and they never return parameter OID as a result.
*/
CREATE MATERIALIZED VIEW m_org_closure AS
WITH RECURSIVE org_h (
    ancestor_oid, -- ref.targetoid
    descendant_oid --ref.ownerOid
    -- paths -- number of different paths, not used for materialized view version
    -- depth -- possible later, but cycle detected must be added to the recursive term
) AS (
    -- non-recursive term:
    -- Gather all organization oids from parent-org refs and initialize identity lines (o => o).
    -- We don't want the orgs not in org hierarchy, that would require org triggers too.
    SELECT o.oid, o.oid FROM m_org o
        WHERE EXISTS(
            SELECT 1 FROM m_ref_object_parent_org r
                WHERE r.targetOid = o.oid OR r.ownerOid = o.oid)
    UNION
    -- recursive (iterative) term:
    -- Generate their parents (anc => desc, that is target => owner), => means "is parent of".
    SELECT par.targetoid, chi.descendant_oid -- leaving original child there generates closure
        FROM m_ref_object_parent_org as par, org_h as chi
        WHERE par.ownerOid = chi.ancestor_oid
)
SELECT * FROM org_h;

-- unique index is like PK if it was table
CREATE UNIQUE INDEX m_org_closure_asc_desc_idx
    ON m_org_closure (ancestor_oid, descendant_oid);
CREATE INDEX m_org_closure_desc_asc_idx
    ON m_org_closure (descendant_oid, ancestor_oid);

-- The trigger for m_ref_object_parent_org that flags the view for refresh.
CREATE OR REPLACE FUNCTION mark_org_closure_for_refresh()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'TRUNCATE' OR OLD.ownerType = 'ORG' OR NEW.ownerType = 'ORG' THEN
        INSERT INTO m_global_metadata VALUES ('orgClosureRefreshNeeded', 'true')
            ON CONFLICT (name) DO UPDATE SET value = 'true';
    END IF;

    -- after trigger returns null
    RETURN NULL;
END $$;

CREATE TRIGGER m_ref_object_parent_mark_refresh_tr
    AFTER INSERT OR UPDATE OR DELETE ON m_ref_object_parent_org
    FOR EACH ROW EXECUTE FUNCTION mark_org_closure_for_refresh();
CREATE TRIGGER m_ref_object_parent_mark_refresh_trunc_tr
    AFTER TRUNCATE ON m_ref_object_parent_org
    FOR EACH STATEMENT EXECUTE FUNCTION mark_org_closure_for_refresh();

-- The trigger that flags the view for refresh after m_org changes.
CREATE OR REPLACE FUNCTION mark_org_closure_for_refresh_org()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO m_global_metadata VALUES ('orgClosureRefreshNeeded', 'true')
        ON CONFLICT (name) DO UPDATE SET value = 'true';

    -- after trigger returns null
    RETURN NULL;
END $$;

-- Update is not necessary, it does not change relations between orgs.
-- If it does, it is handled by trigger on m_ref_object_parent_org.
CREATE TRIGGER m_org_mark_refresh_tr
    AFTER INSERT OR DELETE ON m_org
    FOR EACH ROW EXECUTE FUNCTION mark_org_closure_for_refresh_org();
CREATE TRIGGER m_org_mark_refresh_trunc_tr
    AFTER TRUNCATE ON m_org
    FOR EACH STATEMENT EXECUTE FUNCTION mark_org_closure_for_refresh_org();

-- This procedure for conditional refresh when needed is called from the application code.
-- The refresh can be forced, e.g. after many changes with triggers off (or just to be sure).
CREATE OR REPLACE PROCEDURE m_refresh_org_closure(force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    flag_val text;
BEGIN
    -- We use advisory session lock only for the check + refresh, then release it immediately.
    -- This can still dead-lock two transactions in a single thread on the select/delete combo,
    -- (I mean, who would do that?!) but works fine for parallel transactions.
    PERFORM pg_advisory_lock(47);
    BEGIN
        SELECT value INTO flag_val FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        IF flag_val = 'true' OR force THEN
            REFRESH MATERIALIZED VIEW m_org_closure;
            DELETE FROM m_global_metadata WHERE name = 'orgClosureRefreshNeeded';
        END IF;
        PERFORM pg_advisory_unlock(47);
    EXCEPTION WHEN OTHERS THEN
        -- Whatever happens we definitely want to release the lock.
        PERFORM pg_advisory_unlock(47);
        RAISE;
    END;
END;
$$;
-- endregion

-- region OTHER object tables
-- Represents ResourceType, see https://docs.evolveum.com/midpoint/reference/resources/resource-configuration/
CREATE TABLE m_resource (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('RESOURCE') STORED
        CHECK (objectType = 'RESOURCE'),
    businessAdministrativeState ResourceAdministrativeStateType,
    -- administrativeOperationalState/administrativeAvailabilityStatus
    administrativeOperationalStateAdministrativeAvailabilityStatus AdministrativeAvailabilityStatusType,
    -- operationalState/lastAvailabilityStatus
    operationalStateLastAvailabilityStatus AvailabilityStatusType,
    connectorRefTargetOid UUID,
    connectorRefTargetType ObjectType,
    connectorRefRelationId INTEGER REFERENCES m_uri(id),
    template BOOLEAN,
    abstract BOOLEAN,
    superRefTargetOid UUID,
    superRefTargetType ObjectType,
    superRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_resource_oid_insert_tr BEFORE INSERT ON m_resource
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_resource_update_tr BEFORE UPDATE ON m_resource
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_resource_oid_delete_tr AFTER DELETE ON m_resource
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_resource_nameOrig_idx ON m_resource (nameOrig);
CREATE UNIQUE INDEX m_resource_nameNorm_key ON m_resource (nameNorm);
CREATE INDEX m_resource_subtypes_idx ON m_resource USING gin(subtypes);
CREATE INDEX m_resource_fullTextInfo_idx ON m_resource USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_resource_createTimestamp_idx ON m_resource (createTimestamp);
CREATE INDEX m_resource_modifyTimestamp_idx ON m_resource (modifyTimestamp);

-- stores ResourceType/business/approverRef
CREATE TABLE m_ref_resource_business_configuration_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS
        ('RESOURCE_BUSINESS_CONFIGURATION_APPROVER') STORED,

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_resource_biz_config_approver_targetOidRelationId_idx
    ON m_ref_resource_business_configuration_approver (targetOid, relationId);

-- Represents ShadowType, see https://docs.evolveum.com/midpoint/reference/resources/shadow/
-- and also https://docs.evolveum.com/midpoint/reference/schema/focus-and-projections/
CREATE TABLE m_shadow (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SHADOW') STORED
        CHECK (objectType = 'SHADOW'),
    objectClassId INTEGER REFERENCES m_uri(id),
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    intent TEXT,
    tag TEXT,
    kind ShadowKindType,
    dead BOOLEAN,
    exist BOOLEAN,
    fullSynchronizationTimestamp TIMESTAMPTZ,
    pendingOperationCount INTEGER NOT NULL,
    primaryIdentifierValue TEXT,
    synchronizationSituation SynchronizationSituationType,
    synchronizationTimestamp TIMESTAMPTZ,
    attributes JSONB,
    -- correlation
    correlationStartTimestamp TIMESTAMPTZ,
    correlationEndTimestamp TIMESTAMPTZ,
    correlationCaseOpenTimestamp TIMESTAMPTZ,
    correlationCaseCloseTimestamp TIMESTAMPTZ,
    correlationSituation CorrelationSituationType
)
    INHERITS (m_object);

CREATE TRIGGER m_shadow_oid_insert_tr BEFORE INSERT ON m_shadow
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_shadow_update_tr BEFORE UPDATE ON m_shadow
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_shadow_oid_delete_tr AFTER DELETE ON m_shadow
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_shadow_nameOrig_idx ON m_shadow (nameOrig);
CREATE INDEX m_shadow_nameNorm_idx ON m_shadow (nameNorm); -- may not be unique for shadows!
CREATE UNIQUE INDEX m_shadow_primIdVal_objCls_resRefOid_key
    ON m_shadow (primaryIdentifierValue, objectClassId, resourceRefTargetOid);

CREATE INDEX m_shadow_subtypes_idx ON m_shadow USING gin(subtypes);
CREATE INDEX m_shadow_policySituation_idx ON m_shadow USING gin(policysituations gin__int_ops);
CREATE INDEX m_shadow_ext_idx ON m_shadow USING gin(ext);
CREATE INDEX m_shadow_attributes_idx ON m_shadow USING gin(attributes);
CREATE INDEX m_shadow_fullTextInfo_idx ON m_shadow USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_shadow_resourceRefTargetOid_idx ON m_shadow (resourceRefTargetOid);
CREATE INDEX m_shadow_createTimestamp_idx ON m_shadow (createTimestamp);
CREATE INDEX m_shadow_modifyTimestamp_idx ON m_shadow (modifyTimestamp);
CREATE INDEX m_shadow_correlationStartTimestamp_idx ON m_shadow (correlationStartTimestamp);
CREATE INDEX m_shadow_correlationEndTimestamp_idx ON m_shadow (correlationEndTimestamp);
CREATE INDEX m_shadow_correlationCaseOpenTimestamp_idx ON m_shadow (correlationCaseOpenTimestamp);
CREATE INDEX m_shadow_correlationCaseCloseTimestamp_idx ON m_shadow (correlationCaseCloseTimestamp);

/*
TODO: reconsider, especially boolean things like dead (perhaps WHERE in other indexes?)
CREATE INDEX iShadowDead ON m_shadow (dead);
CREATE INDEX iShadowKind ON m_shadow (kind);
CREATE INDEX iShadowIntent ON m_shadow (intent);
CREATE INDEX iShadowObjectClass ON m_shadow (objectClass);
CREATE INDEX iShadowFailedOperationType ON m_shadow (failedOperationType);
CREATE INDEX iShadowSyncSituation ON m_shadow (synchronizationSituation);
CREATE INDEX iShadowPendingOperationCount ON m_shadow (pendingOperationCount);
*/

-- Represents NodeType, see https://docs.evolveum.com/midpoint/reference/deployment/clustering-ha/managing-cluster-nodes/
CREATE TABLE m_node (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('NODE') STORED
        CHECK (objectType = 'NODE'),
    nodeIdentifier TEXT,
    operationalState NodeOperationalStateType
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_node_oid_insert_tr BEFORE INSERT ON m_node
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_node_update_tr BEFORE UPDATE ON m_node
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_node_oid_delete_tr AFTER DELETE ON m_node
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_node_nameOrig_idx ON m_node (nameOrig);
CREATE UNIQUE INDEX m_node_nameNorm_key ON m_node (nameNorm);
-- not interested in other indexes for this one, this table will be small

-- Represents SystemConfigurationType, see https://docs.evolveum.com/midpoint/reference/concepts/system-configuration-object/
CREATE TABLE m_system_configuration (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SYSTEM_CONFIGURATION') STORED
        CHECK (objectType = 'SYSTEM_CONFIGURATION')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_system_configuration_oid_insert_tr BEFORE INSERT ON m_system_configuration
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_system_configuration_update_tr BEFORE UPDATE ON m_system_configuration
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_system_configuration_oid_delete_tr AFTER DELETE ON m_system_configuration
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE UNIQUE INDEX m_system_configuration_nameNorm_key ON m_system_configuration (nameNorm);
-- no need for the name index, m_system_configuration table is very small

-- Represents SecurityPolicyType, see https://docs.evolveum.com/midpoint/reference/security/security-policy/
CREATE TABLE m_security_policy (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SECURITY_POLICY') STORED
        CHECK (objectType = 'SECURITY_POLICY')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_security_policy_oid_insert_tr BEFORE INSERT ON m_security_policy
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_security_policy_update_tr BEFORE UPDATE ON m_security_policy
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_security_policy_oid_delete_tr AFTER DELETE ON m_security_policy
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_security_policy_nameOrig_idx ON m_security_policy (nameOrig);
CREATE UNIQUE INDEX m_security_policy_nameNorm_key ON m_security_policy (nameNorm);
CREATE INDEX m_security_policy_subtypes_idx ON m_security_policy USING gin(subtypes);
CREATE INDEX m_security_policy_policySituation_idx
    ON m_security_policy USING gin(policysituations gin__int_ops);
CREATE INDEX m_security_policy_fullTextInfo_idx
    ON m_security_policy USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_security_policy_createTimestamp_idx ON m_security_policy (createTimestamp);
CREATE INDEX m_security_policy_modifyTimestamp_idx ON m_security_policy (modifyTimestamp);

-- Represents ObjectCollectionType, see https://docs.evolveum.com/midpoint/reference/admin-gui/collections-views/configuration/
CREATE TABLE m_object_collection (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('OBJECT_COLLECTION') STORED
        CHECK (objectType = 'OBJECT_COLLECTION')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_object_collection_oid_insert_tr BEFORE INSERT ON m_object_collection
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_object_collection_update_tr BEFORE UPDATE ON m_object_collection
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_object_collection_oid_delete_tr AFTER DELETE ON m_object_collection
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_object_collection_nameOrig_idx ON m_object_collection (nameOrig);
CREATE UNIQUE INDEX m_object_collection_nameNorm_key ON m_object_collection (nameNorm);
CREATE INDEX m_object_collection_subtypes_idx ON m_object_collection USING gin(subtypes);
CREATE INDEX m_object_collection_policySituation_idx
    ON m_object_collection USING gin(policysituations gin__int_ops);
CREATE INDEX m_object_collection_fullTextInfo_idx
    ON m_object_collection USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_object_collection_createTimestamp_idx ON m_object_collection (createTimestamp);
CREATE INDEX m_object_collection_modifyTimestamp_idx ON m_object_collection (modifyTimestamp);

-- Represents DashboardType, see https://docs.evolveum.com/midpoint/reference/admin-gui/dashboards/configuration/
CREATE TABLE m_dashboard (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('DASHBOARD') STORED
        CHECK (objectType = 'DASHBOARD')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_dashboard_oid_insert_tr BEFORE INSERT ON m_dashboard
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_dashboard_update_tr BEFORE UPDATE ON m_dashboard
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_dashboard_oid_delete_tr AFTER DELETE ON m_dashboard
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_dashboard_nameOrig_idx ON m_dashboard (nameOrig);
CREATE UNIQUE INDEX m_dashboard_nameNorm_key ON m_dashboard (nameNorm);
CREATE INDEX m_dashboard_subtypes_idx ON m_dashboard USING gin(subtypes);
CREATE INDEX m_dashboard_policySituation_idx
    ON m_dashboard USING gin(policysituations gin__int_ops);
CREATE INDEX m_dashboard_createTimestamp_idx ON m_dashboard (createTimestamp);
CREATE INDEX m_dashboard_modifyTimestamp_idx ON m_dashboard (modifyTimestamp);

-- Represents ValuePolicyType
CREATE TABLE m_value_policy (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('VALUE_POLICY') STORED
        CHECK (objectType = 'VALUE_POLICY')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_value_policy_oid_insert_tr BEFORE INSERT ON m_value_policy
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_value_policy_update_tr BEFORE UPDATE ON m_value_policy
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_value_policy_oid_delete_tr AFTER DELETE ON m_value_policy
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_value_policy_nameOrig_idx ON m_value_policy (nameOrig);
CREATE UNIQUE INDEX m_value_policy_nameNorm_key ON m_value_policy (nameNorm);
CREATE INDEX m_value_policy_subtypes_idx ON m_value_policy USING gin(subtypes);
CREATE INDEX m_value_policy_policySituation_idx
    ON m_value_policy USING gin(policysituations gin__int_ops);
CREATE INDEX m_value_policy_createTimestamp_idx ON m_value_policy (createTimestamp);
CREATE INDEX m_value_policy_modifyTimestamp_idx ON m_value_policy (modifyTimestamp);

-- Represents ReportType, see https://docs.evolveum.com/midpoint/reference/misc/reports/report-configuration/
CREATE TABLE m_report (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('REPORT') STORED
        CHECK (objectType = 'REPORT')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_report_oid_insert_tr BEFORE INSERT ON m_report
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_report_update_tr BEFORE UPDATE ON m_report
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_report_oid_delete_tr AFTER DELETE ON m_report
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_report_nameOrig_idx ON m_report (nameOrig);
CREATE UNIQUE INDEX m_report_nameNorm_key ON m_report (nameNorm);
CREATE INDEX m_report_subtypes_idx ON m_report USING gin(subtypes);
CREATE INDEX m_report_policySituation_idx ON m_report USING gin(policysituations gin__int_ops);
CREATE INDEX m_report_createTimestamp_idx ON m_report (createTimestamp);
CREATE INDEX m_report_modifyTimestamp_idx ON m_report (modifyTimestamp);

-- Represents ReportDataType, see also m_report above
CREATE TABLE m_report_data (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('REPORT_DATA') STORED
        CHECK (objectType = 'REPORT_DATA'),
    reportRefTargetOid UUID,
    reportRefTargetType ObjectType,
    reportRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_report_data_oid_insert_tr BEFORE INSERT ON m_report_data
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_report_data_update_tr BEFORE UPDATE ON m_report_data
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_report_data_oid_delete_tr AFTER DELETE ON m_report_data
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_report_data_nameOrig_idx ON m_report_data (nameOrig);
CREATE INDEX m_report_data_nameNorm_idx ON m_report_data (nameNorm); -- not unique
CREATE INDEX m_report_data_subtypes_idx ON m_report_data USING gin(subtypes);
CREATE INDEX m_report_data_policySituation_idx
    ON m_report_data USING gin(policysituations gin__int_ops);
CREATE INDEX m_report_data_createTimestamp_idx ON m_report_data (createTimestamp);
CREATE INDEX m_report_data_modifyTimestamp_idx ON m_report_data (modifyTimestamp);


CREATE TABLE m_role_analysis_cluster (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_CLUSTER') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_CLUSTER'),
        parentRefTargetOid UUID,
        parentRefTargetType ObjectType,
        parentRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_cluster_oid_insert_tr BEFORE INSERT ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_cluster_update_tr BEFORE UPDATE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_cluster_oid_delete_tr AFTER DELETE ON m_role_analysis_cluster
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_role_analysis_cluster_parentRefTargetOid_idx ON m_role_analysis_cluster (parentRefTargetOid);
CREATE INDEX m_role_analysis_cluster_parentRefTargetType_idx ON m_role_analysis_cluster (parentRefTargetType);
CREATE INDEX m_role_analysis_cluster_parentRefRelationId_idx ON m_role_analysis_cluster (parentRefRelationId);


CREATE TABLE m_role_analysis_session (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ROLE_ANALYSIS_SESSION') STORED
        CHECK (objectType = 'ROLE_ANALYSIS_SESSION')
        )
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_role_analysis_session_oid_insert_tr BEFORE INSERT ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_role_analysis_session_update_tr BEFORE UPDATE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_role_analysis_session_oid_delete_tr AFTER DELETE ON m_role_analysis_session
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();



-- Represents LookupTableType, see https://docs.evolveum.com/midpoint/reference/misc/lookup-tables/
CREATE TABLE m_lookup_table (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('LOOKUP_TABLE') STORED
        CHECK (objectType = 'LOOKUP_TABLE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_lookup_table_oid_insert_tr BEFORE INSERT ON m_lookup_table
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_lookup_table_update_tr BEFORE UPDATE ON m_lookup_table
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_lookup_table_oid_delete_tr AFTER DELETE ON m_lookup_table
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_lookup_table_nameOrig_idx ON m_lookup_table (nameOrig);
CREATE UNIQUE INDEX m_lookup_table_nameNorm_key ON m_lookup_table (nameNorm);
CREATE INDEX m_lookup_table_subtypes_idx ON m_lookup_table USING gin(subtypes);
CREATE INDEX m_lookup_table_policySituation_idx
    ON m_lookup_table USING gin(policysituations gin__int_ops);
CREATE INDEX m_lookup_table_createTimestamp_idx ON m_lookup_table (createTimestamp);
CREATE INDEX m_lookup_table_modifyTimestamp_idx ON m_lookup_table (modifyTimestamp);

-- Represents LookupTableRowType, see also m_lookup_table above
CREATE TABLE m_lookup_table_row (
    ownerOid UUID NOT NULL REFERENCES m_lookup_table(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('LOOKUP_TABLE_ROW') STORED
        CHECK (containerType = 'LOOKUP_TABLE_ROW'),
    key TEXT,
    value TEXT,
    labelOrig TEXT,
    labelNorm TEXT,
    lastChangeTimestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE UNIQUE INDEX m_lookup_table_row_ownerOid_key_key ON m_lookup_table_row (ownerOid, key);

-- Represents ConnectorType, see https://docs.evolveum.com/connectors/connectors/
CREATE TABLE m_connector (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('CONNECTOR') STORED
        CHECK (objectType = 'CONNECTOR'),
    connectorBundle TEXT, -- typically a package name
    connectorType TEXT NOT NULL, -- typically a class name
    connectorVersion TEXT NOT NULL,
    frameworkId INTEGER REFERENCES m_uri(id),
    connectorHostRefTargetOid UUID,
    connectorHostRefTargetType ObjectType,
    connectorHostRefRelationId INTEGER REFERENCES m_uri(id),
    displayNameOrig TEXT,
    displayNameNorm TEXT,
    targetSystemTypes INTEGER[],
    available BOOLEAN
)
    INHERITS (m_assignment_holder);





CREATE TRIGGER m_connector_oid_insert_tr BEFORE INSERT ON m_connector
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_connector_update_tr BEFORE UPDATE ON m_connector
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_connector_oid_delete_tr AFTER DELETE ON m_connector
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE UNIQUE INDEX m_connector_typeVersion_key
    ON m_connector (connectorType, connectorVersion)
    WHERE connectorHostRefTargetOid IS NULL;
CREATE UNIQUE INDEX m_connector_typeVersionHost_key
    ON m_connector (connectorType, connectorVersion, connectorHostRefTargetOid)
    WHERE connectorHostRefTargetOid IS NOT NULL;
CREATE INDEX m_connector_nameOrig_idx ON m_connector (nameOrig);
CREATE INDEX m_connector_nameNorm_idx ON m_connector (nameNorm);
CREATE INDEX m_connector_subtypes_idx ON m_connector USING gin(subtypes);
CREATE INDEX m_connector_policySituation_idx
    ON m_connector USING gin(policysituations gin__int_ops);
CREATE INDEX m_connector_createTimestamp_idx ON m_connector (createTimestamp);
CREATE INDEX m_connector_modifyTimestamp_idx ON m_connector (modifyTimestamp);

-- Represents ConnectorHostType, see https://docs.evolveum.com/connectors/connid/1.x/connector-server/
CREATE TABLE m_connector_host (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('CONNECTOR_HOST') STORED
        CHECK (objectType = 'CONNECTOR_HOST'),
    hostname TEXT,
    port TEXT
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_connector_host_oid_insert_tr BEFORE INSERT ON m_connector_host
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_connector_host_update_tr BEFORE UPDATE ON m_connector_host
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_connector_host_oid_delete_tr AFTER DELETE ON m_connector_host
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_connector_host_nameOrig_idx ON m_connector_host (nameOrig);
CREATE UNIQUE INDEX m_connector_host_nameNorm_key ON m_connector_host (nameNorm);
CREATE INDEX m_connector_host_subtypes_idx ON m_connector_host USING gin(subtypes);
CREATE INDEX m_connector_host_policySituation_idx
    ON m_connector_host USING gin(policysituations gin__int_ops);
CREATE INDEX m_connector_host_createTimestamp_idx ON m_connector_host (createTimestamp);
CREATE INDEX m_connector_host_modifyTimestamp_idx ON m_connector_host (modifyTimestamp);

-- Represents persistent TaskType, see https://docs.evolveum.com/midpoint/reference/tasks/task-manager/
CREATE TABLE m_task (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('TASK') STORED
        CHECK (objectType = 'TASK'),
    taskIdentifier TEXT,
    binding TaskBindingType,
    category TEXT, -- TODO revise, deprecated, probably can go away soon
    completionTimestamp TIMESTAMPTZ,
    executionState TaskExecutionStateType,
    -- Logically fullResult and resultStatus are related, managed by Task manager.
    fullResult BYTEA,
    resultStatus OperationResultStatusType,
    handlerUriId INTEGER REFERENCES m_uri(id),
    lastRunStartTimestamp TIMESTAMPTZ,
    lastRunFinishTimestamp TIMESTAMPTZ,
    node TEXT, -- nodeId only for information purposes
    objectRefTargetOid UUID,
    objectRefTargetType ObjectType,
    objectRefRelationId INTEGER REFERENCES m_uri(id),
    ownerRefTargetOid UUID,
    ownerRefTargetType ObjectType,
    ownerRefRelationId INTEGER REFERENCES m_uri(id),
    parent TEXT, -- value of taskIdentifier
    recurrence TaskRecurrenceType,
    schedulingState TaskSchedulingStateType,
    autoScalingMode TaskAutoScalingModeType, -- autoScaling/mode
    threadStopAction ThreadStopActionType,
    waitingReason TaskWaitingReasonType,
    dependentTaskIdentifiers TEXT[] -- contains values of taskIdentifier
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_task_oid_insert_tr BEFORE INSERT ON m_task
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_task_update_tr BEFORE UPDATE ON m_task
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_task_oid_delete_tr AFTER DELETE ON m_task
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_task_nameOrig_idx ON m_task (nameOrig);
CREATE INDEX m_task_nameNorm_idx ON m_task (nameNorm); -- can have duplicates
CREATE INDEX m_task_parent_idx ON m_task (parent);
CREATE INDEX m_task_objectRefTargetOid_idx ON m_task(objectRefTargetOid);
CREATE UNIQUE INDEX m_task_taskIdentifier_key ON m_task (taskIdentifier);
CREATE INDEX m_task_dependentTaskIdentifiers_idx ON m_task USING gin(dependentTaskIdentifiers);
CREATE INDEX m_task_subtypes_idx ON m_task USING gin(subtypes);
CREATE INDEX m_task_policySituation_idx ON m_task USING gin(policysituations gin__int_ops);
CREATE INDEX m_task_ext_idx ON m_task USING gin(ext);
CREATE INDEX m_task_fullTextInfo_idx ON m_task USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_task_createTimestamp_idx ON m_task (createTimestamp);
CREATE INDEX m_task_modifyTimestamp_idx ON m_task (modifyTimestamp);

CREATE TABLE m_task_affected_objects (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('AFFECTED_OBJECTS') STORED
     CHECK (containerType = 'AFFECTED_OBJECTS'),
    activityId INTEGER REFERENCES m_uri(id),
    type ObjectType,
    archetypeRefTargetOid UUID,
    archetypeRefTargetType ObjectType,
    archetypeRefRelationId INTEGER REFERENCES m_uri(id),
    objectClassId INTEGER REFERENCES m_uri(id),
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    intent TEXT,
    kind ShadowKindType,
    executionMode ExecutionModeType,
    predefinedConfigurationToUse PredefinedConfigurationType,
    PRIMARY KEY (ownerOid, cid)
) INHERITS(m_container);

-- endregion

-- region cases
-- Represents CaseType, see https://docs.evolveum.com/midpoint/features/planned/case-management/
CREATE TABLE m_case (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('CASE') STORED
        CHECK (objectType = 'CASE'),
    state TEXT,
    closeTimestamp TIMESTAMPTZ,
    objectRefTargetOid UUID,
    objectRefTargetType ObjectType,
    objectRefRelationId INTEGER REFERENCES m_uri(id),
    parentRefTargetOid UUID,
    parentRefTargetType ObjectType,
    parentRefRelationId INTEGER REFERENCES m_uri(id),
    requestorRefTargetOid UUID,
    requestorRefTargetType ObjectType,
    requestorRefRelationId INTEGER REFERENCES m_uri(id),
    targetRefTargetOid UUID,
    targetRefTargetType ObjectType,
    targetRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_case_oid_insert_tr BEFORE INSERT ON m_case
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_case_update_tr BEFORE UPDATE ON m_case
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_case_oid_delete_tr AFTER DELETE ON m_case
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_case_nameOrig_idx ON m_case (nameOrig);
CREATE INDEX m_case_nameNorm_idx ON m_case (nameNorm);
CREATE INDEX m_case_subtypes_idx ON m_case USING gin(subtypes);
CREATE INDEX m_case_policySituation_idx ON m_case USING gin(policysituations gin__int_ops);
CREATE INDEX m_case_fullTextInfo_idx ON m_case USING gin(fullTextInfo gin_trgm_ops);

CREATE INDEX m_case_objectRefTargetOid_idx ON m_case(objectRefTargetOid);
CREATE INDEX m_case_targetRefTargetOid_idx ON m_case(targetRefTargetOid);
CREATE INDEX m_case_parentRefTargetOid_idx ON m_case(parentRefTargetOid);
CREATE INDEX m_case_requestorRefTargetOid_idx ON m_case(requestorRefTargetOid);
CREATE INDEX m_case_closeTimestamp_idx ON m_case(closeTimestamp);
CREATE INDEX m_case_createTimestamp_idx ON m_case (createTimestamp);
CREATE INDEX m_case_modifyTimestamp_idx ON m_case (modifyTimestamp);

CREATE TABLE m_case_wi (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('CASE_WORK_ITEM') STORED
        CHECK (containerType = 'CASE_WORK_ITEM'),
    closeTimestamp TIMESTAMPTZ,
    createTimestamp TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    originalAssigneeRefTargetOid UUID,
    originalAssigneeRefTargetType ObjectType,
    originalAssigneeRefRelationId INTEGER REFERENCES m_uri(id),
    outcome TEXT, -- stores workitem/output/outcome
    performerRefTargetOid UUID,
    performerRefTargetType ObjectType,
    performerRefRelationId INTEGER REFERENCES m_uri(id),
    stageNumber INTEGER,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_case_wi_createTimestamp_idx ON m_case_wi (createTimestamp);
CREATE INDEX m_case_wi_closeTimestamp_idx ON m_case_wi (closeTimestamp);
CREATE INDEX m_case_wi_deadline_idx ON m_case_wi (deadline);
CREATE INDEX m_case_wi_originalAssigneeRefTargetOid_idx ON m_case_wi (originalAssigneeRefTargetOid);
CREATE INDEX m_case_wi_performerRefTargetOid_idx ON m_case_wi (performerRefTargetOid);

-- stores workItem/assigneeRef
CREATE TABLE m_case_wi_assignee (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    workItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('CASE_WI_ASSIGNEE') STORED,

    PRIMARY KEY (ownerOid, workItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first three PK columns
ALTER TABLE m_case_wi_assignee ADD CONSTRAINT m_case_wi_assignee_id_fk
    FOREIGN KEY (ownerOid, workItemCid) REFERENCES m_case_wi (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_case_wi_assignee_targetOidRelationId_idx
    ON m_case_wi_assignee (targetOid, relationId);

-- stores workItem/candidateRef
CREATE TABLE m_case_wi_candidate (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    workItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('CASE_WI_CANDIDATE') STORED,

    PRIMARY KEY (ownerOid, workItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns
ALTER TABLE m_case_wi_candidate ADD CONSTRAINT m_case_wi_candidate_id_fk
    FOREIGN KEY (ownerOid, workItemCid) REFERENCES m_case_wi (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_case_wi_candidate_targetOidRelationId_idx
    ON m_case_wi_candidate (targetOid, relationId);
-- endregion

-- region Access Certification object tables
-- Represents AccessCertificationDefinitionType, see https://docs.evolveum.com/midpoint/reference/roles-policies/certification/
CREATE TABLE m_access_cert_definition (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_DEFINITION') STORED
        CHECK (objectType = 'ACCESS_CERTIFICATION_DEFINITION'),
    handlerUriId INTEGER REFERENCES m_uri(id),
    lastCampaignStartedTimestamp TIMESTAMPTZ,
    lastCampaignClosedTimestamp TIMESTAMPTZ,
    ownerRefTargetOid UUID,
    ownerRefTargetType ObjectType,
    ownerRefRelationId INTEGER REFERENCES m_uri(id)
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_access_cert_definition_oid_insert_tr BEFORE INSERT ON m_access_cert_definition
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_access_cert_definition_update_tr BEFORE UPDATE ON m_access_cert_definition
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_access_cert_definition_oid_delete_tr AFTER DELETE ON m_access_cert_definition
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_access_cert_definition_nameOrig_idx ON m_access_cert_definition (nameOrig);
CREATE UNIQUE INDEX m_access_cert_definition_nameNorm_key ON m_access_cert_definition (nameNorm);
CREATE INDEX m_access_cert_definition_subtypes_idx ON m_access_cert_definition USING gin(subtypes);
CREATE INDEX m_access_cert_definition_policySituation_idx
    ON m_access_cert_definition USING gin(policysituations gin__int_ops);
CREATE INDEX m_access_cert_definition_ext_idx ON m_access_cert_definition USING gin(ext);
CREATE INDEX m_access_cert_definition_fullTextInfo_idx
    ON m_access_cert_definition USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_access_cert_definition_createTimestamp_idx ON m_access_cert_definition (createTimestamp);
CREATE INDEX m_access_cert_definition_modifyTimestamp_idx ON m_access_cert_definition (modifyTimestamp);

CREATE TABLE m_access_cert_campaign (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_CAMPAIGN') STORED
        CHECK (objectType = 'ACCESS_CERTIFICATION_CAMPAIGN'),
    definitionRefTargetOid UUID,
    definitionRefTargetType ObjectType,
    definitionRefRelationId INTEGER REFERENCES m_uri(id),
    endTimestamp TIMESTAMPTZ,
    handlerUriId INTEGER REFERENCES m_uri(id),
    campaignIteration INTEGER NOT NULL,
    ownerRefTargetOid UUID,
    ownerRefTargetType ObjectType,
    ownerRefRelationId INTEGER REFERENCES m_uri(id),
    stageNumber INTEGER,
    startTimestamp TIMESTAMPTZ,
    state AccessCertificationCampaignStateType
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_access_cert_campaign_oid_insert_tr BEFORE INSERT ON m_access_cert_campaign
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_access_cert_campaign_update_tr BEFORE UPDATE ON m_access_cert_campaign
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_access_cert_campaign_oid_delete_tr AFTER DELETE ON m_access_cert_campaign
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_access_cert_campaign_nameOrig_idx ON m_access_cert_campaign (nameOrig);
CREATE UNIQUE INDEX m_access_cert_campaign_nameNorm_key ON m_access_cert_campaign (nameNorm);
CREATE INDEX m_access_cert_campaign_subtypes_idx ON m_access_cert_campaign USING gin(subtypes);
CREATE INDEX m_access_cert_campaign_policySituation_idx
    ON m_access_cert_campaign USING gin(policysituations gin__int_ops);
CREATE INDEX m_access_cert_campaign_ext_idx ON m_access_cert_campaign USING gin(ext);
CREATE INDEX m_access_cert_campaign_fullTextInfo_idx
    ON m_access_cert_campaign USING gin(fullTextInfo gin_trgm_ops);
CREATE INDEX m_access_cert_campaign_createTimestamp_idx ON m_access_cert_campaign (createTimestamp);
CREATE INDEX m_access_cert_campaign_modifyTimestamp_idx ON m_access_cert_campaign (modifyTimestamp);

CREATE TABLE m_access_cert_case (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_CASE') STORED
        CHECK (containerType = 'ACCESS_CERTIFICATION_CASE'),
    administrativeStatus ActivationStatusType,
    archiveTimestamp TIMESTAMPTZ,
    disableReason TEXT,
    disableTimestamp TIMESTAMPTZ,
    effectiveStatus ActivationStatusType,
    enableTimestamp TIMESTAMPTZ,
    validFrom TIMESTAMPTZ,
    validTo TIMESTAMPTZ,
    validityChangeTimestamp TIMESTAMPTZ,
    validityStatus TimeIntervalStatusType,
    currentStageOutcome TEXT,
    fullObject BYTEA,
    campaignIteration INTEGER NOT NULL,
    objectRefTargetOid UUID,
    objectRefTargetType ObjectType,
    objectRefRelationId INTEGER REFERENCES m_uri(id),
    orgRefTargetOid UUID,
    orgRefTargetType ObjectType,
    orgRefRelationId INTEGER REFERENCES m_uri(id),
    outcome TEXT,
    remediedTimestamp TIMESTAMPTZ,
    currentStageDeadline TIMESTAMPTZ,
    currentStageCreateTimestamp TIMESTAMPTZ,
    stageNumber INTEGER,
    targetRefTargetOid UUID,
    targetRefTargetType ObjectType,
    targetRefRelationId INTEGER REFERENCES m_uri(id),
    tenantRefTargetOid UUID,
    tenantRefTargetType ObjectType,
    tenantRefRelationId INTEGER REFERENCES m_uri(id),

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_access_cert_case_objectRefTargetOid_idx ON m_access_cert_case (objectRefTargetOid);
CREATE INDEX m_access_cert_case_targetRefTargetOid_idx ON m_access_cert_case (targetRefTargetOid);
CREATE INDEX m_access_cert_case_tenantRefTargetOid_idx ON m_access_cert_case (tenantRefTargetOid);
CREATE INDEX m_access_cert_case_orgRefTargetOid_idx ON m_access_cert_case (orgRefTargetOid);

CREATE TABLE m_access_cert_wi (
    ownerOid UUID NOT NULL, -- PK+FK
    accessCertCaseCid INTEGER NOT NULL, -- PK+FK
    containerType ContainerType GENERATED ALWAYS AS ('ACCESS_CERTIFICATION_WORK_ITEM') STORED
        CHECK (containerType = 'ACCESS_CERTIFICATION_WORK_ITEM'),
    closeTimestamp TIMESTAMPTZ,
    campaignIteration INTEGER NOT NULL,
    outcome TEXT, -- stores output/outcome
    outputChangeTimestamp TIMESTAMPTZ,
    performerRefTargetOid UUID,
    performerRefTargetType ObjectType,
    performerRefRelationId INTEGER REFERENCES m_uri(id),
    stageNumber INTEGER,

    PRIMARY KEY (ownerOid, accessCertCaseCid, cid)
)
    INHERITS(m_container);

-- indexed by first two PK columns
ALTER TABLE m_access_cert_wi
    ADD CONSTRAINT m_access_cert_wi_id_fk FOREIGN KEY (ownerOid, accessCertCaseCid)
        REFERENCES m_access_cert_case (ownerOid, cid)
        ON DELETE CASCADE;

-- stores case/workItem/assigneeRef
CREATE TABLE m_access_cert_wi_assignee (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    accessCertCaseCid INTEGER NOT NULL,
    accessCertWorkItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ACCESS_CERT_WI_ASSIGNEE') STORED,

    PRIMARY KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns, TODO: isn't this one superfluous with the next one?
ALTER TABLE m_access_cert_wi_assignee ADD CONSTRAINT m_access_cert_wi_assignee_id_fk_case
    FOREIGN KEY (ownerOid, accessCertCaseCid) REFERENCES m_access_cert_case (ownerOid, cid)
        ON DELETE CASCADE;

-- indexed by first three PK columns
ALTER TABLE m_access_cert_wi_assignee ADD CONSTRAINT m_access_cert_wi_assignee_id_fk_wi
    FOREIGN KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid)
        REFERENCES m_access_cert_wi (ownerOid, accessCertCaseCid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_access_cert_wi_assignee_targetOidRelationId_idx
    ON m_access_cert_wi_assignee (targetOid, relationId);

-- stores case/workItem/candidateRef
CREATE TABLE m_access_cert_wi_candidate (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    accessCertCaseCid INTEGER NOT NULL,
    accessCertWorkItemCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ACCESS_CERT_WI_CANDIDATE') STORED,

    PRIMARY KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns, TODO: isn't this one superfluous with the next one?
ALTER TABLE m_access_cert_wi_candidate ADD CONSTRAINT m_access_cert_wi_candidate_id_fk_case
    FOREIGN KEY (ownerOid, accessCertCaseCid) REFERENCES m_access_cert_case (ownerOid, cid)
        ON DELETE CASCADE;

-- indexed by first three PK columns
ALTER TABLE m_access_cert_wi_candidate ADD CONSTRAINT m_access_cert_wi_candidate_id_fk_wi
    FOREIGN KEY (ownerOid, accessCertCaseCid, accessCertWorkItemCid)
        REFERENCES m_access_cert_wi (ownerOid, accessCertCaseCid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_access_cert_wi_candidate_targetOidRelationId_idx
    ON m_access_cert_wi_candidate (targetOid, relationId);
-- endregion

-- region ObjectTemplateType
CREATE TABLE m_object_template (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('OBJECT_TEMPLATE') STORED
        CHECK (objectType = 'OBJECT_TEMPLATE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_object_template_oid_insert_tr BEFORE INSERT ON m_object_template
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_object_template_update_tr BEFORE UPDATE ON m_object_template
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_object_template_oid_delete_tr AFTER DELETE ON m_object_template
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_object_template_nameOrig_idx ON m_object_template (nameOrig);
CREATE UNIQUE INDEX m_object_template_nameNorm_key ON m_object_template (nameNorm);
CREATE INDEX m_object_template_subtypes_idx ON m_object_template USING gin(subtypes);
CREATE INDEX m_object_template_policySituation_idx
    ON m_object_template USING gin(policysituations gin__int_ops);
CREATE INDEX m_object_template_createTimestamp_idx ON m_object_template (createTimestamp);
CREATE INDEX m_object_template_modifyTimestamp_idx ON m_object_template (modifyTimestamp);

-- stores ObjectTemplateType/includeRef
CREATE TABLE m_ref_include (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    referenceType ReferenceType GENERATED ALWAYS AS ('INCLUDE') STORED
        CHECK (referenceType = 'INCLUDE'),

    PRIMARY KEY (ownerOid, relationId, targetOid)
)
    INHERITS (m_reference);

CREATE INDEX m_ref_include_targetOidRelationId_idx
    ON m_ref_include (targetOid, relationId);
-- endregion

-- region FunctionLibrary/Sequence/Form tables
-- Represents FunctionLibraryType, see https://docs.evolveum.com/midpoint/reference/expressions/function-libraries/
CREATE TABLE m_function_library (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('FUNCTION_LIBRARY') STORED
        CHECK (objectType = 'FUNCTION_LIBRARY')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_function_library_oid_insert_tr BEFORE INSERT ON m_function_library
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_function_library_update_tr BEFORE UPDATE ON m_function_library
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_function_library_oid_delete_tr AFTER DELETE ON m_function_library
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_function_library_nameOrig_idx ON m_function_library (nameOrig);
CREATE UNIQUE INDEX m_function_library_nameNorm_key ON m_function_library (nameNorm);
CREATE INDEX m_function_library_subtypes_idx ON m_function_library USING gin(subtypes);
CREATE INDEX m_function_library_policySituation_idx
    ON m_function_library USING gin(policysituations gin__int_ops);

-- Represents SequenceType, see https://docs.evolveum.com/midpoint/reference/expressions/sequences/
CREATE TABLE m_sequence (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SEQUENCE') STORED
        CHECK (objectType = 'SEQUENCE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_sequence_oid_insert_tr BEFORE INSERT ON m_sequence
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_sequence_update_tr BEFORE UPDATE ON m_sequence
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_sequence_oid_delete_tr AFTER DELETE ON m_sequence
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_sequence_nameOrig_idx ON m_sequence (nameOrig);
CREATE UNIQUE INDEX m_sequence_nameNorm_key ON m_sequence (nameNorm);
CREATE INDEX m_sequence_subtypes_idx ON m_sequence USING gin(subtypes);
CREATE INDEX m_sequence_policySituation_idx ON m_sequence USING gin(policysituations gin__int_ops);
CREATE INDEX m_sequence_createTimestamp_idx ON m_sequence (createTimestamp);
CREATE INDEX m_sequence_modifyTimestamp_idx ON m_sequence (modifyTimestamp);

-- Represents FormType, see https://docs.evolveum.com/midpoint/reference/admin-gui/custom-forms/
CREATE TABLE m_form (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('FORM') STORED
        CHECK (objectType = 'FORM')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_form_oid_insert_tr BEFORE INSERT ON m_form
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_form_update_tr BEFORE UPDATE ON m_form
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_form_oid_delete_tr AFTER DELETE ON m_form
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_form_nameOrig_idx ON m_form (nameOrig);
CREATE UNIQUE INDEX m_form_nameNorm_key ON m_form (nameNorm);
CREATE INDEX m_form_subtypes_idx ON m_form USING gin(subtypes);
CREATE INDEX m_form_policySituation_idx ON m_form USING gin(policysituations gin__int_ops);
CREATE INDEX m_form_createTimestamp_idx ON m_form (createTimestamp);
CREATE INDEX m_form_modifyTimestamp_idx ON m_form (modifyTimestamp);
-- endregion

-- region Notification and message transport
-- Represents MessageTemplateType
CREATE TABLE m_message_template (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MESSAGE_TEMPLATE') STORED
        CHECK (objectType = 'MESSAGE_TEMPLATE')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_message_template_oid_insert_tr BEFORE INSERT ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_message_template_update_tr BEFORE UPDATE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_message_template_oid_delete_tr AFTER DELETE ON m_message_template
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE INDEX m_message_template_nameOrig_idx ON m_message_template (nameOrig);
CREATE UNIQUE INDEX m_message_template_nameNorm_key ON m_message_template (nameNorm);
CREATE INDEX m_message_template_policySituation_idx
    ON m_message_template USING gin(policysituations gin__int_ops);
CREATE INDEX m_message_template_createTimestamp_idx ON m_message_template (createTimestamp);
CREATE INDEX m_message_template_modifyTimestamp_idx ON m_message_template (modifyTimestamp);
-- endregion

-- region Assignment/Inducement table
-- Represents AssignmentType, see https://docs.evolveum.com/midpoint/reference/roles-policies/assignment/
-- and also https://docs.evolveum.com/midpoint/reference/roles-policies/assignment/assignment-vs-inducement/
CREATE TABLE m_assignment (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    -- this is different from other containers, this is not generated, app must provide it
    containerType ContainerType NOT NULL CHECK (containerType IN ('ASSIGNMENT', 'INDUCEMENT')),
    ownerType ObjectType NOT NULL,
    lifecycleState TEXT,
    orderValue INTEGER, -- item "order"
    orgRefTargetOid UUID,
    orgRefTargetType ObjectType,
    orgRefRelationId INTEGER REFERENCES m_uri(id),
    targetRefTargetOid UUID,
    targetRefTargetType ObjectType,
    targetRefRelationId INTEGER REFERENCES m_uri(id),
    tenantRefTargetOid UUID,
    tenantRefTargetType ObjectType,
    tenantRefRelationId INTEGER REFERENCES m_uri(id),
    policySituations INTEGER[], -- soft-references m_uri, add index per table
    subtypes TEXT[], -- only EQ filter
    ext JSONB,
    -- construction
    resourceRefTargetOid UUID,
    resourceRefTargetType ObjectType,
    resourceRefRelationId INTEGER REFERENCES m_uri(id),
    -- activation
    administrativeStatus ActivationStatusType,
    effectiveStatus ActivationStatusType,
    enableTimestamp TIMESTAMPTZ,
    disableTimestamp TIMESTAMPTZ,
    disableReason TEXT,
    validityStatus TimeIntervalStatusType,
    validFrom TIMESTAMPTZ,
    validTo TIMESTAMPTZ,
    validityChangeTimestamp TIMESTAMPTZ,
    archiveTimestamp TIMESTAMPTZ,
    -- metadata
    creatorRefTargetOid UUID,
    creatorRefTargetType ObjectType,
    creatorRefRelationId INTEGER REFERENCES m_uri(id),
    createChannelId INTEGER REFERENCES m_uri(id),
    createTimestamp TIMESTAMPTZ,
    modifierRefTargetOid UUID,
    modifierRefTargetType ObjectType,
    modifierRefRelationId INTEGER REFERENCES m_uri(id),
    modifyChannelId INTEGER REFERENCES m_uri(id),
    modifyTimestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
);

CREATE INDEX m_assignment_policySituation_idx
    ON m_assignment USING gin(policysituations gin__int_ops);
CREATE INDEX m_assignment_subtypes_idx ON m_assignment USING gin(subtypes);
CREATE INDEX m_assignment_ext_idx ON m_assignment USING gin(ext);
-- TODO was: CREATE INDEX iAssignmentAdministrative ON m_assignment (administrativeStatus);
-- administrativeStatus has 3 states (ENABLED/DISABLED/ARCHIVED), not sure it's worth indexing
-- but it can be used as a condition to index other (e.g. WHERE administrativeStatus='ENABLED')
-- TODO the same: CREATE INDEX iAssignmentEffective ON m_assignment (effectiveStatus);
CREATE INDEX m_assignment_validFrom_idx ON m_assignment (validFrom);
CREATE INDEX m_assignment_validTo_idx ON m_assignment (validTo);
CREATE INDEX m_assignment_targetRefTargetOid_idx ON m_assignment (targetRefTargetOid);
CREATE INDEX m_assignment_tenantRefTargetOid_idx ON m_assignment (tenantRefTargetOid);
CREATE INDEX m_assignment_orgRefTargetOid_idx ON m_assignment (orgRefTargetOid);
CREATE INDEX m_assignment_resourceRefTargetOid_idx ON m_assignment (resourceRefTargetOid);
CREATE INDEX m_assignment_createTimestamp_idx ON m_assignment (createTimestamp);
CREATE INDEX m_assignment_modifyTimestamp_idx ON m_assignment (modifyTimestamp);

-- stores assignment/metadata/createApproverRef
CREATE TABLE m_assignment_ref_create_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    assignmentCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ASSIGNMENT_CREATE_APPROVER') STORED
        CHECK (referenceType = 'ASSIGNMENT_CREATE_APPROVER'),

    PRIMARY KEY (ownerOid, assignmentCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first two PK columns
ALTER TABLE m_assignment_ref_create_approver ADD CONSTRAINT m_assignment_ref_create_approver_id_fk
    FOREIGN KEY (ownerOid, assignmentCid) REFERENCES m_assignment (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_assignment_ref_create_approver_targetOidRelationId_idx
    ON m_assignment_ref_create_approver (targetOid, relationId);

-- stores assignment/metadata/modifyApproverRef
CREATE TABLE m_assignment_ref_modify_approver (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    assignmentCid INTEGER NOT NULL,
    referenceType ReferenceType GENERATED ALWAYS AS ('ASSIGNMENT_MODIFY_APPROVER') STORED
        CHECK (referenceType = 'ASSIGNMENT_MODIFY_APPROVER'),

    PRIMARY KEY (ownerOid, assignmentCid, referenceType, relationId, targetOid)
)
    INHERITS (m_reference);

-- indexed by first three PK columns
ALTER TABLE m_assignment_ref_modify_approver ADD CONSTRAINT m_assignment_ref_modify_approver_id_fk
    FOREIGN KEY (ownerOid, assignmentCid) REFERENCES m_assignment (ownerOid, cid)
        ON DELETE CASCADE;

CREATE INDEX m_assignment_ref_modify_approver_targetOidRelationId_idx
    ON m_assignment_ref_modify_approver (targetOid, relationId);
-- endregion

-- region Other object containers
-- stores ObjectType/trigger (TriggerType)
CREATE TABLE m_trigger (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('TRIGGER') STORED
        CHECK (containerType = 'TRIGGER'),
    handlerUriId INTEGER REFERENCES m_uri(id),
    timestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_trigger_timestamp_idx ON m_trigger (timestamp);

-- stores ObjectType/operationExecution (OperationExecutionType)
CREATE TABLE m_operation_execution (
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
    containerType ContainerType GENERATED ALWAYS AS ('OPERATION_EXECUTION') STORED
        CHECK (containerType = 'OPERATION_EXECUTION'),
    status OperationResultStatusType,
    recordType OperationExecutionRecordTypeType,
    initiatorRefTargetOid UUID,
    initiatorRefTargetType ObjectType,
    initiatorRefRelationId INTEGER REFERENCES m_uri(id),
    taskRefTargetOid UUID,
    taskRefTargetType ObjectType,
    taskRefRelationId INTEGER REFERENCES m_uri(id),
    timestamp TIMESTAMPTZ,

    PRIMARY KEY (ownerOid, cid)
)
    INHERITS(m_container);

CREATE INDEX m_operation_execution_initiatorRefTargetOid_idx
    ON m_operation_execution (initiatorRefTargetOid);
CREATE INDEX m_operation_execution_taskRefTargetOid_idx
    ON m_operation_execution (taskRefTargetOid);
CREATE INDEX m_operation_execution_timestamp_idx ON m_operation_execution (timestamp);
-- index for ownerOid is part of PK
-- TODO: index for status is questionable, don't we want WHERE status = ... to another index instead?
-- endregion


-- region Simulations Support

CREATE TABLE m_simulation_result (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED
        CHECK (objectType = 'SIMULATION_RESULT'),
    partitioned boolean,
    rootTaskRefTargetOid UUID,
    rootTaskRefTargetType ObjectType,
    rootTaskRefRelationId INTEGER REFERENCES m_uri(id),
    startTimestamp TIMESTAMPTZ,
    endTimestamp TIMESTAMPTZ
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_simulation_result_oid_insert_tr BEFORE INSERT ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_simulation_result_update_tr BEFORE UPDATE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_simulation_result_oid_delete_tr AFTER DELETE ON m_simulation_result
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();

CREATE TYPE ObjectProcessingStateType AS ENUM ('UNMODIFIED', 'ADDED', 'MODIFIED', 'DELETED');

CREATE TABLE m_simulation_result_processed_object (
    -- Default OID value is covered by INSERT triggers. No PK defined on abstract tables.
    -- Owner does not have to be the direct parent of the container.
    -- use like this on the concrete table:
    -- ownerOid UUID NOT NULL REFERENCES m_object_oid(oid),
    ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,

    -- Container ID, unique in the scope of the whole object (owner).
    -- While this provides it for sub-tables we will repeat this for clarity, it's part of PK.
    cid BIGINT NOT NULL,
    containerType ContainerType GENERATED ALWAYS AS ('SIMULATION_RESULT_PROCESSED_OBJECT') STORED
        CHECK (containerType = 'SIMULATION_RESULT_PROCESSED_OBJECT'),
    oid UUID,
    objectType ObjectType,
    nameOrig TEXT,
    nameNorm TEXT,
    state ObjectProcessingStateType,
    metricIdentifiers TEXT[],
    fullObject BYTEA,
    objectBefore BYTEA,
    objectAfter BYTEA,
    transactionId TEXT,
    focusRecordId BIGINT,

   PRIMARY KEY (ownerOid, cid)
) PARTITION BY LIST(ownerOid);

CREATE TABLE m_simulation_result_processed_object_default PARTITION OF m_simulation_result_processed_object DEFAULT;

CREATE OR REPLACE FUNCTION m_simulation_result_create_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(new.oid::text,'-','_');
      IF new.partitioned AND NOT EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been created %',partition;
        EXECUTE 'CREATE TABLE ' || partition || ' partition of ' || 'm_simulation_result_processed_object' || ' for values in (''' || new.oid|| ''');';
      END IF;
      RETURN NULL;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_create_partition AFTER INSERT ON m_simulation_result
 FOR EACH ROW EXECUTE FUNCTION m_simulation_result_create_partition();

--- Trigger which deletes processed objects partition when whole simulation is deleted

CREATE OR REPLACE FUNCTION m_simulation_result_delete_partition() RETURNS trigger AS
  $BODY$
    DECLARE
      partition TEXT;
    BEGIN
      partition := 'm_sr_processed_object_' || REPLACE(OLD.oid::text,'-','_');
      IF OLD.partitioned AND EXISTS(SELECT relname FROM pg_class WHERE relname=partition) THEN
        RAISE NOTICE 'A partition has been deleted %',partition;
        EXECUTE 'DROP TABLE IF EXISTS ' || partition || ';';
      END IF;
      RETURN OLD;
    END;
  $BODY$
LANGUAGE plpgsql;

CREATE TRIGGER m_simulation_result_delete_partition BEFORE DELETE ON m_simulation_result
  FOR EACH ROW EXECUTE FUNCTION m_simulation_result_delete_partition();



CREATE TABLE m_processed_object_event_mark (
  ownerOid UUID NOT NULL REFERENCES m_object_oid(oid) ON DELETE CASCADE,
  ownerType ObjectType, -- GENERATED ALWAYS AS ('SIMULATION_RESULT') STORED,
  processedObjectCid INTEGER NOT NULL,
  referenceType ReferenceType GENERATED ALWAYS AS ('PROCESSED_OBJECT_EVENT_MARK') STORED,
  targetOid UUID NOT NULL, -- soft-references m_object
  targetType ObjectType NOT NULL,
  relationId INTEGER NOT NULL REFERENCES m_uri(id)

) PARTITION BY LIST(ownerOid);

CREATE TABLE m_processed_object_event_mark_default PARTITION OF m_processed_object_event_mark DEFAULT;

-- endregion

-- region Mark

CREATE TABLE m_mark (
    oid UUID NOT NULL PRIMARY KEY REFERENCES m_object_oid(oid),
    objectType ObjectType GENERATED ALWAYS AS ('MARK') STORED
        CHECK (objectType = 'MARK')
)
    INHERITS (m_assignment_holder);

CREATE TRIGGER m_mark_oid_insert_tr BEFORE INSERT ON m_mark
    FOR EACH ROW EXECUTE FUNCTION insert_object_oid();
CREATE TRIGGER m_mark_update_tr BEFORE UPDATE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION before_update_object();
CREATE TRIGGER m_mark_oid_delete_tr AFTER DELETE ON m_mark
    FOR EACH ROW EXECUTE FUNCTION delete_object_oid();


-- endregion

-- region Extension support
-- Catalog table of known indexed extension items.
-- While itemName and valueType are both Q-names they are not cached via m_uri because this
-- table is small, itemName does not repeat (valueType does) and readability is also better.
-- This has similar function as m_uri - it translates something to IDs, no need to nest it.
CREATE TABLE m_ext_item (
    id SERIAL NOT NULL PRIMARY KEY,
    itemName TEXT NOT NULL,
    valueType TEXT NOT NULL,
    holderType ExtItemHolderType NOT NULL,
    cardinality ExtItemCardinality NOT NULL
    -- information about storage mechanism (JSON common/separate, column, table separate/common, etc.)
    -- storageType JSONB NOT NULL default '{"type": "EXT_JSON"}', -- currently only JSONB is used
);

-- This works fine for itemName+holderType search used in raw processing
CREATE UNIQUE INDEX m_ext_item_key ON m_ext_item (itemName, holderType, valueType, cardinality);
-- endregion

-- INDEXING:
-- More indexes is possible, but for low-variability columns like lifecycleState or administrative/effectiveStatus
-- better use them in WHERE as needed when slow query appear: https://www.postgresql.org/docs/current/indexes-partial.html
-- Also see: https://docs.evolveum.com/midpoint/reference/repository/native-postgresql/db-maintenance/

-- region Schema versioning and upgrading
/*
Procedure applying a DB schema/data change for main repository tables (audit has separate procedure).
Use sequential change numbers to identify the changes.
This protects re-execution of the same change on the same database instance.
Use dollar-quoted string constant for a change, examples are lower, docs here:
https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
The transaction is committed if the change is executed.
The change number is NOT semantic and uses different key than original 'databaseSchemaVersion'.
Semantic schema versioning is still possible, but now only for information purposes.

Example of an DB upgrade script (stuff between $$ can be multiline, here compressed for brevity):
CALL apply_change(1, $$ create table x(a int); insert into x values (1); $$);
CALL apply_change(2, $$ alter table x add column b text; insert into x values (2, 'two'); $$);
-- not a good idea in general, but "true" forces the execution; it never updates change # to lower
CALL apply_change(1, $$ insert into x values (3, 'three'); $$, true);
*/
CREATE OR REPLACE PROCEDURE apply_change(changeNumber int, change TEXT, force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    lastChange int;
BEGIN
    SELECT value INTO lastChange FROM m_global_metadata WHERE name = 'schemaChangeNumber';

    -- change is executed if the changeNumber is newer - or if forced
    IF lastChange IS NULL OR lastChange < changeNumber OR force THEN
        EXECUTE change;
        RAISE NOTICE 'Change #% executed!', changeNumber;

        IF lastChange IS NULL THEN
            INSERT INTO m_global_metadata (name, value) VALUES ('schemaChangeNumber', changeNumber);
        ELSIF changeNumber > lastChange THEN
            -- even with force we never want to set lower-or-equal change number, hence the IF above
            UPDATE m_global_metadata SET value = changeNumber WHERE name = 'schemaChangeNumber';
        ELSE
            RAISE NOTICE 'Last change number left unchanged: #%', lastChange;
        END IF;
        COMMIT;
    ELSE
        RAISE NOTICE 'Change #% skipped - not newer than the last change #%!', changeNumber, lastChange;
    END IF;
END $$;
-- endregion

-- Initializing the last change number used in postgres-new-upgrade.sql.
-- This is important to avoid applying any change more than once.
-- Also update SqaleUtils.CURRENT_SCHEMA_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java
call apply_change(25, $$ SELECT 1 $$, true);

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/database/scripts/03-audit.sql

```typescript
/*
 * Copyright (C) 2010-2023 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- USAGE NOTES: You can apply this to the main repository schema.
-- For separate audit use this in a separate database.
-- See the docs here: https://docs.evolveum.com/midpoint/reference/repository/native-audit
--
-- @formatter:off because of terribly unreliable IDEA reformat for SQL
-- Naming conventions:
-- M_ prefix is used for tables in main part of the repo, MA_ for audit tables (can be separate)
-- Constraints/indexes use table_column(s)_suffix convention, with PK for primary key,
-- FK foreign key, IDX for index, KEY for unique index.
-- TR is suffix for triggers.
-- Names are generally lowercase (despite prefix/suffixes above in uppercase ;-)).
-- Column names are Java style and match attribute names from M-classes (e.g. MAuditEvent).
--
-- Other notes:
-- TEXT is used instead of VARCHAR, see: https://dba.stackexchange.com/a/21496/157622

-- noinspection SqlResolveForFile @ operator-class/"gin__int_ops"

-- just in case PUBLIC schema was dropped (fastest way to remove all midpoint objects)
-- drop schema public cascade;
CREATE SCHEMA IF NOT EXISTS public;
-- CREATE EXTENSION IF NOT EXISTS pg_trgm; -- support for trigram indexes

-- region custom enum types
DO $$ BEGIN
    -- NOTE: Types in this block must be updated when changed in postgres-new.sql!
    CREATE TYPE ObjectType AS ENUM (
        'ABSTRACT_ROLE',
        'ACCESS_CERTIFICATION_CAMPAIGN',
        'ACCESS_CERTIFICATION_DEFINITION',
        'ARCHETYPE',
        'ASSIGNMENT_HOLDER',
        'CASE',
        'CONNECTOR',
        'CONNECTOR_HOST',
        'DASHBOARD',
        'FOCUS',
        'FORM',
        'FUNCTION_LIBRARY',
        'GENERIC_OBJECT',
        'LOOKUP_TABLE',
        'MARK',
        'MESSAGE_TEMPLATE',
        'NODE',
        'OBJECT',
        'OBJECT_COLLECTION',
        'OBJECT_TEMPLATE',
        'ORG',
        'REPORT',
        'REPORT_DATA',
        'RESOURCE',
        'ROLE',
        'ROLE_ANALYSIS_CLUSTER',
        'ROLE_ANALYSIS_SESSION',
        'SECURITY_POLICY',
        'SEQUENCE',
        'SERVICE',
        'SHADOW',
        'SIMULATION_RESULT',
        'SYSTEM_CONFIGURATION',
        'TASK',
        'USER',
        'VALUE_POLICY');

    CREATE TYPE OperationResultStatusType AS ENUM ('SUCCESS', 'WARNING', 'PARTIAL_ERROR',
        'FATAL_ERROR', 'HANDLED_ERROR', 'NOT_APPLICABLE', 'IN_PROGRESS', 'UNKNOWN');
EXCEPTION WHEN duplicate_object THEN raise notice 'Main repo custom types already exist, OK...'; END $$;

CREATE TYPE AuditEventTypeType AS ENUM ('GET_OBJECT', 'ADD_OBJECT', 'MODIFY_OBJECT',
    'DELETE_OBJECT', 'EXECUTE_CHANGES_RAW', 'SYNCHRONIZATION', 'CREATE_SESSION',
    'TERMINATE_SESSION', 'WORK_ITEM', 'WORKFLOW_PROCESS_INSTANCE', 'RECONCILIATION',
    'SUSPEND_TASK', 'RESUME_TASK', 'RUN_TASK_IMMEDIATELY', 'DISCOVER_OBJECT', 'INFORMATION_DISCLOSURE');

CREATE TYPE AuditEventStageType AS ENUM ('REQUEST', 'EXECUTION', 'RESOURCE');

CREATE TYPE EffectivePrivilegesModificationType AS ENUM ('ELEVATION', 'FULL_ELEVATION', 'REDUCTION', 'OTHER');

CREATE TYPE ChangeType AS ENUM ('ADD', 'MODIFY', 'DELETE');



   -- We try to create ShadowKindType (necessary if audit is in separate database, if it is in same
   -- database as repository, type already exists.
DO $$ BEGIN
       CREATE TYPE ShadowKindType AS ENUM ('ACCOUNT', 'ENTITLEMENT', 'GENERIC', 'UNKNOWN');
   EXCEPTION
       WHEN duplicate_object THEN null;
END $$;
-- endregion

-- region management tables
-- Key -> value config table for internal use.
CREATE TABLE IF NOT EXISTS m_global_metadata (
    name TEXT PRIMARY KEY,
    value TEXT
);
-- endregion

-- region AUDIT
CREATE TABLE ma_audit_event (
    -- ID is generated as unique, but if provided, it is checked for uniqueness
    -- only in combination with timestamp because of partitioning.
    id BIGSERIAL NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    eventIdentifier TEXT,
    eventType AuditEventTypeType,
    eventStage AuditEventStageType,
    sessionIdentifier TEXT,
    requestIdentifier TEXT,
    taskIdentifier TEXT,
    taskOid UUID,
    hostIdentifier TEXT,
    nodeIdentifier TEXT,
    remoteHostAddress TEXT,
    initiatorOid UUID,
    initiatorType ObjectType,
    initiatorName TEXT,
    attorneyOid UUID,
    attorneyName TEXT,
    effectivePrincipalOid UUID,
    effectivePrincipalType ObjectType,
    effectivePrincipalName TEXT,
    effectivePrivilegesModification EffectivePrivilegesModificationType,
    targetOid UUID,
    targetType ObjectType,
    targetName TEXT,
    targetOwnerOid UUID,
    targetOwnerType ObjectType,
    targetOwnerName TEXT,
    channel TEXT, -- full URI, we do not want m_uri ID anymore
    outcome OperationResultStatusType,
    parameter TEXT,
    result TEXT,
    message TEXT,
    changedItemPaths TEXT[],
    resourceOids TEXT[],
    properties JSONB,
    -- ext JSONB, -- TODO extension container later

    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

CREATE INDEX ma_audit_event_timestamp_idx ON ma_audit_event (timestamp);
CREATE INDEX ma_audit_event_eventIdentifier_idx ON ma_audit_event (eventIdentifier);
CREATE INDEX ma_audit_event_sessionIdentifier_idx ON ma_audit_event (sessionIdentifier);
CREATE INDEX ma_audit_event_requestIdentifier_idx ON ma_audit_event (requestIdentifier);
-- This was originally eventStage + targetOid, but low variability eventStage can do more harm.
CREATE INDEX ma_audit_event_targetOid_idx ON ma_audit_event (targetOid);
-- TODO do we want to index every single column or leave the rest to full/partial scans?
-- Original repo/audit didn't have any more indexes either...
CREATE INDEX ma_audit_event_changedItemPaths_idx ON ma_audit_event USING gin(changeditempaths);
CREATE INDEX ma_audit_event_resourceOids_idx ON ma_audit_event USING gin(resourceOids);
CREATE INDEX ma_audit_event_properties_idx ON ma_audit_event USING gin(properties);
-- TODO trigram indexes for LIKE support? What columns? message, ...

CREATE TABLE ma_audit_delta (
    recordId BIGINT NOT NULL, -- references ma_audit_event.id
    timestamp TIMESTAMPTZ NOT NULL, -- references ma_audit_event.timestamp
    checksum TEXT NOT NULL,
    delta BYTEA,
    deltaOid UUID,
    deltaType ChangeType,
    fullResult BYTEA,
    objectNameNorm TEXT,
    objectNameOrig TEXT,
    resourceOid UUID,
    resourceNameNorm TEXT,
    resourceNameOrig TEXT,
    shadowKind ShadowKindType,
    shadowIntent TEXT,
    status OperationResultStatusType,

    PRIMARY KEY (recordId, timestamp, checksum)
) PARTITION BY RANGE (timestamp);

/* Similar FK is created PER PARTITION only, see audit_create_monthly_partitions
   or *_default tables:
ALTER TABLE ma_audit_delta ADD CONSTRAINT ma_audit_delta_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event (id, timestamp)
        ON DELETE CASCADE;

-- Primary key covers the need for FK(recordId, timestamp) as well, no need for explicit index.
*/

-- TODO: any unique combination within single recordId? name+oid+type perhaps?
CREATE TABLE ma_audit_ref (
    id BIGSERIAL NOT NULL, -- unique technical PK
    recordId BIGINT NOT NULL, -- references ma_audit_event.id
    timestamp TIMESTAMPTZ NOT NULL, -- references ma_audit_event.timestamp
    name TEXT, -- multiple refs can have the same name, conceptually it's a Map(name -> refs[])
    targetOid UUID,
    targetType ObjectType,
    targetNameOrig TEXT,
    targetNameNorm TEXT,

    PRIMARY KEY (id, timestamp) -- real PK must contain partition key (timestamp)
) PARTITION BY RANGE (timestamp);

/* Similar FK is created PER PARTITION only:
ALTER TABLE ma_audit_ref ADD CONSTRAINT ma_audit_ref_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event (id, timestamp)
        ON DELETE CASCADE;
*/
-- Index for FK mentioned above.
-- Index can be declared for partitioned table and will be partitioned automatically.
CREATE INDEX ma_audit_ref_recordId_timestamp_idx ON ma_audit_ref (recordId, timestamp);

-- Default tables used when no timestamp range partitions are created:
CREATE TABLE ma_audit_event_default PARTITION OF ma_audit_event DEFAULT;
CREATE TABLE ma_audit_delta_default PARTITION OF ma_audit_delta DEFAULT;
CREATE TABLE ma_audit_ref_default PARTITION OF ma_audit_ref DEFAULT;

/*
For info about what is and is not automatically created on the partition, see:
https://www.postgresql.org/docs/13/sql-createtable.html (search for "PARTITION OF parent_table")
In short, for our case PK and constraints are created automatically, but FK are not.
*/
ALTER TABLE ma_audit_delta_default ADD CONSTRAINT ma_audit_delta_default_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event_default (id, timestamp)
        ON DELETE CASCADE;
ALTER TABLE ma_audit_ref_default ADD CONSTRAINT ma_audit_ref_default_fk
    FOREIGN KEY (recordId, timestamp) REFERENCES ma_audit_event_default (id, timestamp)
        ON DELETE CASCADE;
-- endregion

-- region Schema versioning and upgrading
/*
Procedure applying a DB schema/data change for audit tables.
Use sequential change numbers to identify the changes.
This protects re-execution of the same change on the same database instance.
Use dollar-quoted string constant for a change, examples are lower, docs here:
https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
The transaction is committed if the change is executed.
The change number is NOT semantic and uses different key than original 'databaseSchemaVersion'.
Semantic schema versioning is still possible, but now only for information purposes.

Example of an DB upgrade script (stuff between $$ can be multiline, here compressed for brevity):
CALL apply_audit_change(1, $$ create table x(a int); insert into x values (1); $$);
CALL apply_audit_change(2, $$ alter table x add column b text; insert into x values (2, 'two'); $$);
-- not a good idea in general, but "true" forces the execution; it never updates change # to lower
CALL apply_audit_change(1, $$ insert into x values (3, 'three'); $$, true);
*/
CREATE OR REPLACE PROCEDURE apply_audit_change(changeNumber int, change TEXT, force boolean = false)
    LANGUAGE plpgsql
AS $$
DECLARE
    lastChange int;
BEGIN
    SELECT value INTO lastChange FROM m_global_metadata WHERE name = 'schemaAuditChangeNumber';

    -- change is executed if the changeNumber is newer - or if forced
    IF lastChange IS NULL OR lastChange < changeNumber OR force THEN
        EXECUTE change;
        RAISE NOTICE 'Audit change #% executed!', changeNumber;

        IF lastChange IS NULL THEN
            INSERT INTO m_global_metadata (name, value) VALUES ('schemaAuditChangeNumber', changeNumber);
        ELSIF changeNumber > lastChange THEN
            -- even with force we never want to set lower change number, hence the IF above
            UPDATE m_global_metadata SET value = changeNumber WHERE name = 'schemaAuditChangeNumber';
        END IF;
        COMMIT;
    ELSE
        RAISE NOTICE 'Audit change #% skipped - not newer than the last change #%!', changeNumber, lastChange;
    END IF;
END $$;
-- endregion

-- https://www.postgresql.org/docs/current/runtime-config-query.html#GUC-ENABLE-PARTITIONWISE-JOIN
DO $$ BEGIN
    EXECUTE 'ALTER DATABASE ' || current_database() || ' SET enable_partitionwise_join TO on';
END; $$;

-- region partition creation procedures
-- Use negative futureCount for creating partitions for the past months if needed.
-- See also the comment below the procedure for more details.
CREATE OR REPLACE PROCEDURE audit_create_monthly_partitions(futureCount int)
    LANGUAGE plpgsql
AS $$
DECLARE
    dateFrom TIMESTAMPTZ = date_trunc('month', current_timestamp);
    dateTo TIMESTAMPTZ;
    tableSuffix TEXT;
BEGIN
    -- noinspection SqlUnused
    FOR i IN 1..abs(futureCount) loop
        dateTo := dateFrom + interval '1 month';
        tableSuffix := to_char(dateFrom, 'YYYYMM');

        BEGIN
            -- PERFORM = select without using the result
            PERFORM ('ma_audit_event_' || tableSuffix)::regclass;
            RAISE NOTICE 'Tables for partition % already exist, OK...', tableSuffix;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Creating partitions for range: % - %', dateFrom, dateTo;

            -- values FROM are inclusive (>=), TO are exclusive (<)
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_event FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_event_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_delta FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_delta_' || tableSuffix, dateFrom, dateTo);
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF ma_audit_ref FOR VALUES FROM (%L) TO (%L);',
                    'ma_audit_ref_' || tableSuffix, dateFrom, dateTo);

/*
For info about what is and is not automatically created on the partition, see:
https://www.postgresql.org/docs/13/sql-createtable.html (search for "PARTITION OF parent_table")
In short, for our case PK and constraints are created automatically, but FK are not.
*/
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_delta_' || tableSuffix,
                    'ma_audit_delta_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (recordId, timestamp)' ||
                    ' REFERENCES %I (id, timestamp) ON DELETE CASCADE',
                    'ma_audit_ref_' || tableSuffix,
                    'ma_audit_ref_' || tableSuffix || '_fk',
                    'ma_audit_event_' || tableSuffix);
        END;

        IF futureCount < 0 THEN
            -- going to the past
            dateFrom := dateFrom - interval '1 month';
        ELSE
            dateFrom := dateTo;
        END IF;

    END loop;
END $$;
-- endregion

/*
IMPORTANT: Only default partitions are created in this script!
Consider, whether you need partitioning before doing anything, for more read the docs:
https://docs.evolveum.com/midpoint/reference/repository/native-audit/#partitioning

Use something like this, if you desire monthly partitioning:
call audit_create_monthly_partitions(120);

This creates 120 monthly partitions into the future (10 years).
It can be safely called multiple times, so you can run it again anytime in the future.
If you forget to run, audit events will go to default partition so no data is lost,
however it may be complicated to organize it into proper partitions after the fact.

Create past partitions if needed, e.g. for migration. E.g., for last 12 months (including current):
call audit_create_monthly_partitions(-12);

Check the existing partitions with this SQL query:
select inhrelid::regclass as partition
from pg_inherits
where inhparent = 'ma_audit_event'::regclass;

Try this to see recent audit events with the real table where they are stored:
select tableoid::regclass::text AS table_name, *
from ma_audit_event
order by id desc
limit 50;
*/

-- Initializing the last change number used in postgres-new-upgrade.sql.
-- This is important to avoid applying any change more than once.
-- Also update SqaleUtils.CURRENT_SCHEMA_AUDIT_CHANGE_NUMBER
-- repo/repo-sqale/src/main/java/com/evolveum/midpoint/repo/sqale/SqaleUtils.java
call apply_audit_change(8, $$ SELECT 1 $$, true);

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/database/scripts/04-quartz.sql

```typescript
/*
 * Copyright (C) 2010-2021 Evolveum and contributors
 *
 * This work is dual-licensed under the Apache License 2.0
 * and European Union Public License. See LICENSE file for details.
 */

-- Thanks to Patrick Lightbody for submitting this.

drop table if exists qrtz_fired_triggers;
DROP TABLE if exists QRTZ_PAUSED_TRIGGER_GRPS;
DROP TABLE if exists QRTZ_SCHEDULER_STATE;
DROP TABLE if exists QRTZ_LOCKS;
drop table if exists qrtz_simple_triggers;
drop table if exists qrtz_cron_triggers;
drop table if exists qrtz_simprop_triggers;
DROP TABLE if exists QRTZ_BLOB_TRIGGERS;
drop table if exists qrtz_triggers;
drop table if exists qrtz_job_details;
drop table if exists qrtz_calendars;

CREATE TABLE qrtz_job_details (
    SCHED_NAME VARCHAR(120) NOT NULL,
    JOB_NAME VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    JOB_CLASS_NAME VARCHAR(250) NOT NULL,
    IS_DURABLE BOOL NOT NULL,
    IS_NONCONCURRENT BOOL NOT NULL,
    IS_UPDATE_DATA BOOL NOT NULL,
    REQUESTS_RECOVERY BOOL NOT NULL,
    JOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME, JOB_NAME, JOB_GROUP)
);

CREATE TABLE qrtz_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    JOB_NAME VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    NEXT_FIRE_TIME BIGINT NULL,
    PREV_FIRE_TIME BIGINT NULL,
    PRIORITY INTEGER NULL,
    EXECUTION_GROUP VARCHAR(200) NULL,
    TRIGGER_STATE VARCHAR(16) NOT NULL,
    TRIGGER_TYPE VARCHAR(8) NOT NULL,
    START_TIME BIGINT NOT NULL,
    END_TIME BIGINT NULL,
    CALENDAR_NAME VARCHAR(200) NULL,
    MISFIRE_INSTR SMALLINT NULL,
    JOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, JOB_NAME, JOB_GROUP)
        REFERENCES QRTZ_JOB_DETAILS(SCHED_NAME, JOB_NAME, JOB_GROUP)
);

CREATE TABLE qrtz_simple_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    REPEAT_COUNT BIGINT NOT NULL,
    REPEAT_INTERVAL BIGINT NOT NULL,
    TIMES_TRIGGERED BIGINT NOT NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_cron_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    CRON_EXPRESSION VARCHAR(120) NOT NULL,
    TIME_ZONE_ID VARCHAR(80),
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_simprop_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    STR_PROP_1 VARCHAR(512) NULL,
    STR_PROP_2 VARCHAR(512) NULL,
    STR_PROP_3 VARCHAR(512) NULL,
    INT_PROP_1 INT NULL,
    INT_PROP_2 INT NULL,
    LONG_PROP_1 BIGINT NULL,
    LONG_PROP_2 BIGINT NULL,
    DEC_PROP_1 NUMERIC(13, 4) NULL,
    DEC_PROP_2 NUMERIC(13, 4) NULL,
    BOOL_PROP_1 BOOL NULL,
    BOOL_PROP_2 BOOL NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_blob_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    BLOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_calendars (
    SCHED_NAME VARCHAR(120) NOT NULL,
    CALENDAR_NAME VARCHAR(200) NOT NULL,
    CALENDAR BYTEA NOT NULL,
    PRIMARY KEY (SCHED_NAME, CALENDAR_NAME)
);


CREATE TABLE qrtz_paused_trigger_grps (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_GROUP)
);

CREATE TABLE qrtz_fired_triggers (
    SCHED_NAME VARCHAR(120) NOT NULL,
    ENTRY_ID VARCHAR(95) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    FIRED_TIME BIGINT NOT NULL,
    SCHED_TIME BIGINT NOT NULL,
    PRIORITY INTEGER NOT NULL,
    EXECUTION_GROUP VARCHAR(200) NULL,
    STATE VARCHAR(16) NOT NULL,
    JOB_NAME VARCHAR(200) NULL,
    JOB_GROUP VARCHAR(200) NULL,
    IS_NONCONCURRENT BOOL NULL,
    REQUESTS_RECOVERY BOOL NULL,
    PRIMARY KEY (SCHED_NAME, ENTRY_ID)
);

CREATE TABLE qrtz_scheduler_state (
    SCHED_NAME VARCHAR(120) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    LAST_CHECKIN_TIME BIGINT NOT NULL,
    CHECKIN_INTERVAL BIGINT NOT NULL,
    PRIMARY KEY (SCHED_NAME, INSTANCE_NAME)
);

CREATE TABLE qrtz_locks (
    SCHED_NAME VARCHAR(120) NOT NULL,
    LOCK_NAME VARCHAR(40) NOT NULL,
    PRIMARY KEY (SCHED_NAME, LOCK_NAME)
);

create index idx_qrtz_j_req_recovery on qrtz_job_details(SCHED_NAME, REQUESTS_RECOVERY);
create index idx_qrtz_j_grp on qrtz_job_details(SCHED_NAME, JOB_GROUP);

create index idx_qrtz_t_j on qrtz_triggers(SCHED_NAME, JOB_NAME, JOB_GROUP);
create index idx_qrtz_t_jg on qrtz_triggers(SCHED_NAME, JOB_GROUP);
create index idx_qrtz_t_c on qrtz_triggers(SCHED_NAME, CALENDAR_NAME);
create index idx_qrtz_t_g on qrtz_triggers(SCHED_NAME, TRIGGER_GROUP);
create index idx_qrtz_t_state on qrtz_triggers(SCHED_NAME, TRIGGER_STATE);
create index idx_qrtz_t_n_state on qrtz_triggers(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP, TRIGGER_STATE);
create index idx_qrtz_t_n_g_state on qrtz_triggers(SCHED_NAME, TRIGGER_GROUP, TRIGGER_STATE);
create index idx_qrtz_t_next_fire_time on qrtz_triggers(SCHED_NAME, NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_st on qrtz_triggers(SCHED_NAME, TRIGGER_STATE, NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_misfire on qrtz_triggers(SCHED_NAME, MISFIRE_INSTR, NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_st_misfire on qrtz_triggers(SCHED_NAME, MISFIRE_INSTR, NEXT_FIRE_TIME, TRIGGER_STATE);
create index idx_qrtz_t_nft_st_misfire_grp on qrtz_triggers(SCHED_NAME, MISFIRE_INSTR, NEXT_FIRE_TIME, TRIGGER_GROUP, TRIGGER_STATE);

create index idx_qrtz_ft_trig_inst_name on qrtz_fired_triggers(SCHED_NAME, INSTANCE_NAME);
create index idx_qrtz_ft_inst_job_req_rcvry on qrtz_fired_triggers(SCHED_NAME, INSTANCE_NAME, REQUESTS_RECOVERY);
create index idx_qrtz_ft_j_g on qrtz_fired_triggers(SCHED_NAME, JOB_NAME, JOB_GROUP);
create index idx_qrtz_ft_jg on qrtz_fired_triggers(SCHED_NAME, JOB_GROUP);
create index idx_qrtz_ft_t_g on qrtz_fired_triggers(SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP);
create index idx_qrtz_ft_tg on qrtz_fired_triggers(SCHED_NAME, TRIGGER_GROUP);

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/registry/scripts/10-persons.sql

```typescript
-- Adding user: padmin (UID: 3000000)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000000, 'Person', 'Administrator', 'Person Administrator', 'UNREPORTED', false, false, false, false, 'deploy', '2022-10-21T17:19:40', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000000, 'USERNAME', 'padmin', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000000, 5000000);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (3000000, 'USER', 'VT', 'padmin', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (3000000, 6000000);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000000, 3000000, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000001, 3000000, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000002, 3000000, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000000, 3000000, 'padmin', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000000, 5000000);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000000, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000000, 8000000);

-- Adding user: pcontact (UID: 3000001)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000001, 'Person', 'Contact', 'Person Contact', 'UNREPORTED', false, false, false, false, 'deploy', '2024-02-01T23:44:56', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000001, 'USERNAME', 'pcontact', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000001, 5000001);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (3000001, 'USER', 'VT', 'pcontact', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (3000001, 6000001);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000003, 3000001, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000004, 3000001, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000005, 3000001, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000001, 3000001, 'pcontact', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000001, 5000001);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000001, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000001, 8000001);

-- Adding user: mwaller0 (UID: 1000000)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000002, 'Matthew', 'Waller', 'Matthew Waller', 'UNREPORTED', false, false, false, false, 'deploy', '2020-04-24T16:15:20', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000002, 'USERNAME', 'mwaller0', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000002, 5000002);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000000, 'USER', 'VT', 'mwaller0', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000000, 6000002);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000006, 1000000, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000007, 1000000, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000008, 1000000, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000002, 1000000, 'mwaller0', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000002, 5000002);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000002, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000002, 8000002);

-- Adding user: ajones1 (UID: 1000001)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000003, 'Amy', 'Jones', 'Amy Jones', 'UNREPORTED', false, false, false, false, 'deploy', '2024-05-26T14:20:35', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000003, 'USERNAME', 'ajones1', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000003, 5000003);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000001, 'USER', 'VT', 'ajones1', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000001, 6000003);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000009, 1000001, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000010, 1000001, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000011, 1000001, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000003, 1000001, 'ajones1', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000003, 5000003);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000003, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000003, 8000003);

-- Adding user: awilson2 (UID: 1000002)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000004, 'Alexander', 'Wilson', 'Alexander Wilson', 'UNREPORTED', false, false, false, false, 'deploy', '2023-03-03T14:37:09', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000004, 'USERNAME', 'awilson2', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000004, 5000004);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000002, 'USER', 'VT', 'awilson2', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000002, 6000004);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000012, 1000002, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000013, 1000002, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000014, 1000002, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000004, 1000002, 'awilson2', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000004, 5000004);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000004, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000004, 8000004);

-- Adding user: zcamacho3 (UID: 1000003)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000005, 'Zachary', 'Camacho', 'Zachary Camacho', 'UNREPORTED', false, false, false, false, 'deploy', '2024-03-10T20:29:01', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000005, 'USERNAME', 'zcamacho3', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000005, 5000005);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000003, 'USER', 'VT', 'zcamacho3', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000003, 6000005);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000015, 1000003, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000016, 1000003, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000017, 1000003, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000005, 1000003, 'zcamacho3', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000005, 5000005);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000005, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000005, 8000005);

-- Adding user: eramirez4 (UID: 1000004)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000006, 'Eddie', 'Ramirez', 'Eddie Ramirez', 'UNREPORTED', false, false, false, false, 'deploy', '2022-04-25T05:56:12', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000006, 'USERNAME', 'eramirez4', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000006, 5000006);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000004, 'USER', 'VT', 'eramirez4', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000004, 6000006);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000018, 1000004, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000019, 1000004, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000020, 1000004, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000006, 1000004, 'eramirez4', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000006, 5000006);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000006, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000006, 8000006);

-- Adding user: kyoung5 (UID: 1000005)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000007, 'Kyle', 'Young', 'Kyle Young', 'UNREPORTED', false, false, false, false, 'deploy', '2020-04-19T05:59:20', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000007, 'USERNAME', 'kyoung5', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000007, 5000007);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000005, 'USER', 'VT', 'kyoung5', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000005, 6000007);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000021, 1000005, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000022, 1000005, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000023, 1000005, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000007, 1000005, 'kyoung5', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000007, 5000007);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000007, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000007, 8000007);

-- Adding user: csims6 (UID: 1000006)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000008, 'Christine', 'Sims', 'Christine Sims', 'UNREPORTED', false, false, false, false, 'deploy', '2022-12-18T23:35:21', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000008, 'USERNAME', 'csims6', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000008, 5000008);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000006, 'USER', 'VT', 'csims6', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000006, 6000008);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000024, 1000006, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000025, 1000006, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000026, 1000006, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000008, 1000006, 'csims6', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000008, 5000008);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000008, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000008, 8000008);

-- Adding user: cmendez7 (UID: 1000007)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000009, 'Caitlin', 'Mendez', 'Caitlin Mendez', 'UNREPORTED', false, false, false, false, 'deploy', '2021-09-01T19:45:58', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000009, 'USERNAME', 'cmendez7', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000009, 5000009);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000007, 'USER', 'VT', 'cmendez7', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000007, 6000009);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000027, 1000007, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000028, 1000007, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000029, 1000007, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000009, 1000007, 'cmendez7', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000009, 5000009);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000009, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000009, 8000009);

-- Adding user: jferguson8 (UID: 1000008)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000010, 'Jay', 'Ferguson', 'Jay Ferguson', 'UNREPORTED', false, false, false, false, 'deploy', '2021-07-27T01:31:54', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000010, 'USERNAME', 'jferguson8', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000010, 5000010);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000008, 'USER', 'VT', 'jferguson8', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000008, 6000010);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000030, 1000008, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000031, 1000008, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000032, 1000008, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000010, 1000008, 'jferguson8', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000010, 5000010);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000010, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000010, 8000010);

-- Adding user: mgonzalez9 (UID: 1000009)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000011, 'Mary', 'Gonzalez', 'Mary Gonzalez', 'UNREPORTED', false, false, false, false, 'deploy', '2020-01-17T11:37:00', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000011, 'USERNAME', 'mgonzalez9', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000011, 5000011);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000009, 'USER', 'VT', 'mgonzalez9', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000009, 6000011);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000033, 1000009, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000034, 1000009, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000035, 1000009, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000011, 1000009, 'mgonzalez9', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000011, 5000011);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000011, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000011, 8000011);

-- Adding user: bmyers10 (UID: 1000010)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000012, 'Brittany', 'Myers', 'Brittany Myers', 'UNREPORTED', false, false, false, false, 'deploy', '2022-12-10T20:12:36', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000012, 'USERNAME', 'bmyers10', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000012, 5000012);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000010, 'USER', 'VT', 'bmyers10', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000010, 6000012);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000036, 1000010, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000037, 1000010, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000038, 1000010, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000012, 1000010, 'bmyers10', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000012, 5000012);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000012, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000012, 8000012);

-- Adding user: mthomas11 (UID: 1000011)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000013, 'Melanie', 'Thomas', 'Melanie Thomas', 'UNREPORTED', false, false, false, false, 'deploy', '2023-07-18T17:03:15', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000013, 'USERNAME', 'mthomas11', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000013, 5000013);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000011, 'USER', 'VT', 'mthomas11', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000011, 6000013);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000039, 1000011, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000040, 1000011, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000041, 1000011, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000013, 1000011, 'mthomas11', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000013, 5000013);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000013, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000013, 8000013);

-- Adding user: rgonzales12 (UID: 1000012)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000014, 'Renee', 'Gonzales', 'Renee Gonzales', 'UNREPORTED', false, false, false, false, 'deploy', '2022-06-21T14:19:10', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000014, 'USERNAME', 'rgonzales12', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000014, 5000014);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000012, 'USER', 'VT', 'rgonzales12', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000012, 6000014);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000042, 1000012, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000043, 1000012, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000044, 1000012, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000014, 1000012, 'rgonzales12', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000014, 5000014);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000014, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000014, 8000014);

-- Adding user: bmolina13 (UID: 1000013)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000015, 'Brenda', 'Molina', 'Brenda Molina', 'UNREPORTED', false, false, false, false, 'deploy', '2023-11-17T15:22:06', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000015, 'USERNAME', 'bmolina13', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000015, 5000015);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000013, 'USER', 'VT', 'bmolina13', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000013, 6000015);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000045, 1000013, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000046, 1000013, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000047, 1000013, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000015, 1000013, 'bmolina13', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000015, 5000015);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000015, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000015, 8000015);

-- Adding user: jhall14 (UID: 1000014)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000016, 'Jasmine', 'Hall', 'Jasmine Hall', 'UNREPORTED', false, false, false, false, 'deploy', '2021-10-06T18:58:56', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000016, 'USERNAME', 'jhall14', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000016, 5000016);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000014, 'USER', 'VT', 'jhall14', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000014, 6000016);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000048, 1000014, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000049, 1000014, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000050, 1000014, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000016, 1000014, 'jhall14', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000016, 5000016);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000016, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000016, 8000016);

-- Adding user: mstewart15 (UID: 1000015)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000017, 'Melissa', 'Stewart', 'Melissa Stewart', 'UNREPORTED', false, false, false, false, 'deploy', '2021-03-26T01:58:08', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000017, 'USERNAME', 'mstewart15', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000017, 5000017);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000015, 'USER', 'VT', 'mstewart15', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000015, 6000017);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000051, 1000015, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000052, 1000015, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000053, 1000015, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000017, 1000015, 'mstewart15', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000017, 5000017);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000017, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000017, 8000017);

-- Adding user: ldillon16 (UID: 1000016)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000018, 'Lauren', 'Dillon', 'Lauren Dillon', 'UNREPORTED', false, false, false, false, 'deploy', '2020-02-27T16:01:21', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000018, 'USERNAME', 'ldillon16', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000018, 5000018);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000016, 'USER', 'VT', 'ldillon16', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000016, 6000018);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000054, 1000016, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000055, 1000016, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000056, 1000016, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000018, 1000016, 'ldillon16', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000018, 5000018);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000018, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000018, 8000018);

-- Adding user: mmueller17 (UID: 1000017)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000019, 'Michael', 'Mueller', 'Michael Mueller', 'UNREPORTED', false, false, false, false, 'deploy', '2021-03-21T03:14:12', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000019, 'USERNAME', 'mmueller17', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000019, 5000019);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000017, 'USER', 'VT', 'mmueller17', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000017, 6000019);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000057, 1000017, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000058, 1000017, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000059, 1000017, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000019, 1000017, 'mmueller17', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000019, 5000019);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000019, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000019, 8000019);

-- Adding user: dlopez18 (UID: 1000018)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000020, 'David', 'Lopez', 'David Lopez', 'UNREPORTED', false, false, false, false, 'deploy', '2020-09-15T08:49:04', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000020, 'USERNAME', 'dlopez18', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000020, 5000020);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000018, 'USER', 'VT', 'dlopez18', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000018, 6000020);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000060, 1000018, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000061, 1000018, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000062, 1000018, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000020, 1000018, 'dlopez18', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000020, 5000020);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000020, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000020, 8000020);

-- Adding user: tpadilla19 (UID: 1000019)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000021, 'Timothy', 'Padilla', 'Timothy Padilla', 'UNREPORTED', false, false, false, false, 'deploy', '2021-07-26T12:38:56', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000021, 'USERNAME', 'tpadilla19', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000021, 5000021);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000019, 'USER', 'VT', 'tpadilla19', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000019, 6000021);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000063, 1000019, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000064, 1000019, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000065, 1000019, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000021, 1000019, 'tpadilla19', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000021, 5000021);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000021, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000021, 8000021);

-- Adding user: nlyons20 (UID: 1000020)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000022, 'Nicholas', 'Lyons', 'Nicholas Lyons', 'UNREPORTED', false, false, false, false, 'deploy', '2023-02-22T00:39:31', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000022, 'USERNAME', 'nlyons20', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000022, 5000022);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000020, 'USER', 'VT', 'nlyons20', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000020, 6000022);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000066, 1000020, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000067, 1000020, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000068, 1000020, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000022, 1000020, 'nlyons20', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000022, 5000022);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000022, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000022, 8000022);

-- Adding user: dcannon21 (UID: 1000021)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000023, 'Desiree', 'Cannon', 'Desiree Cannon', 'UNREPORTED', false, false, false, false, 'deploy', '2021-11-19T23:17:12', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000023, 'USERNAME', 'dcannon21', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000023, 5000023);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000021, 'USER', 'VT', 'dcannon21', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000021, 6000023);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000069, 1000021, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000070, 1000021, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000071, 1000021, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000023, 1000021, 'dcannon21', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000023, 5000023);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000023, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000023, 8000023);

-- Adding user: jgonzalez22 (UID: 1000022)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000024, 'James', 'Gonzalez', 'James Gonzalez', 'UNREPORTED', false, false, false, false, 'deploy', '2022-12-22T11:37:06', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000024, 'USERNAME', 'jgonzalez22', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000024, 5000024);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000022, 'USER', 'VT', 'jgonzalez22', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000022, 6000024);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000072, 1000022, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000073, 1000022, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000074, 1000022, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000024, 1000022, 'jgonzalez22', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000024, 5000024);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000024, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000024, 8000024);

-- Adding user: afernandez23 (UID: 1000023)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000025, 'Allison', 'Fernandez', 'Allison Fernandez', 'UNREPORTED', false, false, false, false, 'deploy', '2023-10-10T18:45:50', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000025, 'USERNAME', 'afernandez23', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000025, 5000025);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000023, 'USER', 'VT', 'afernandez23', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000023, 6000025);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000075, 1000023, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000076, 1000023, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000077, 1000023, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000025, 1000023, 'afernandez23', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000025, 5000025);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000025, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000025, 8000025);

-- Adding user: kcollins24 (UID: 1000024)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000026, 'Katherine', 'Collins', 'Katherine Collins', 'UNREPORTED', false, false, false, false, 'deploy', '2023-07-03T20:46:15', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000026, 'USERNAME', 'kcollins24', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000026, 5000026);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000024, 'USER', 'VT', 'kcollins24', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000024, 6000026);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000078, 1000024, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000079, 1000024, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000080, 1000024, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000026, 1000024, 'kcollins24', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000026, 5000026);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000026, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000026, 8000026);

-- Adding user: ldixon25 (UID: 1000025)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000027, 'Leah', 'Dixon', 'Leah Dixon', 'UNREPORTED', false, false, false, false, 'deploy', '2023-05-31T09:07:34', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000027, 'USERNAME', 'ldixon25', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000027, 5000027);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000025, 'USER', 'VT', 'ldixon25', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000025, 6000027);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000081, 1000025, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000082, 1000025, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000083, 1000025, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000027, 1000025, 'ldixon25', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000027, 5000027);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000027, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000027, 8000027);

-- Adding user: jallen26 (UID: 1000026)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000028, 'Julia', 'Allen', 'Julia Allen', 'UNREPORTED', false, false, false, false, 'deploy', '2023-08-30T19:32:32', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000028, 'USERNAME', 'jallen26', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000028, 5000028);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000026, 'USER', 'VT', 'jallen26', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000026, 6000028);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000084, 1000026, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000085, 1000026, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000086, 1000026, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000028, 1000026, 'jallen26', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000028, 5000028);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000028, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000028, 8000028);

-- Adding user: kwebb27 (UID: 1000027)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000029, 'Kelly', 'Webb', 'Kelly Webb', 'UNREPORTED', false, false, false, false, 'deploy', '2022-09-18T00:19:28', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000029, 'USERNAME', 'kwebb27', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000029, 5000029);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000027, 'USER', 'VT', 'kwebb27', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000027, 6000029);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000087, 1000027, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000088, 1000027, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000089, 1000027, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000029, 1000027, 'kwebb27', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000029, 5000029);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000029, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000029, 8000029);

-- Adding user: gpope28 (UID: 1000028)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000030, 'Grace', 'Pope', 'Grace Pope', 'UNREPORTED', false, false, false, false, 'deploy', '2020-01-03T15:03:37', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000030, 'USERNAME', 'gpope28', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000030, 5000030);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000028, 'USER', 'VT', 'gpope28', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000028, 6000030);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000090, 1000028, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000091, 1000028, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000092, 1000028, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000030, 1000028, 'gpope28', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000030, 5000030);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000030, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000030, 8000030);

-- Adding user: jvazquez29 (UID: 1000029)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000031, 'Jonathan', 'Vazquez', 'Jonathan Vazquez', 'UNREPORTED', false, false, false, false, 'deploy', '2020-08-22T05:32:39', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000031, 'USERNAME', 'jvazquez29', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000031, 5000031);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000029, 'USER', 'VT', 'jvazquez29', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000029, 6000031);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000093, 1000029, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000094, 1000029, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000095, 1000029, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000031, 1000029, 'jvazquez29', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000031, 5000031);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000031, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000031, 8000031);

-- Adding user: wmcintyre30 (UID: 1000030)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000032, 'William', 'Mcintyre', 'William Mcintyre', 'UNREPORTED', false, false, false, false, 'deploy', '2024-04-11T07:08:01', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000032, 'USERNAME', 'wmcintyre30', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000032, 5000032);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000030, 'USER', 'VT', 'wmcintyre30', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000030, 6000032);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000096, 1000030, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000097, 1000030, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000098, 1000030, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000032, 1000030, 'wmcintyre30', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000032, 5000032);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000032, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000032, 8000032);

-- Adding user: jjohnson31 (UID: 1000031)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000033, 'Jo', 'Johnson', 'Jo Johnson', 'UNREPORTED', false, false, false, false, 'deploy', '2021-01-30T01:14:05', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000033, 'USERNAME', 'jjohnson31', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000033, 5000033);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000031, 'USER', 'VT', 'jjohnson31', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000031, 6000033);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000099, 1000031, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000100, 1000031, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000101, 1000031, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000033, 1000031, 'jjohnson31', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000033, 5000033);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000033, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000033, 8000033);

-- Adding user: mharris32 (UID: 1000032)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000034, 'Michelle', 'Harris', 'Michelle Harris', 'UNREPORTED', false, false, false, false, 'deploy', '2023-01-16T03:18:16', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000034, 'USERNAME', 'mharris32', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000034, 5000034);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000032, 'USER', 'VT', 'mharris32', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000032, 6000034);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000102, 1000032, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000103, 1000032, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000104, 1000032, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000034, 1000032, 'mharris32', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000034, 5000034);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000034, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000034, 8000034);

-- Adding user: bmoss33 (UID: 1000033)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000035, 'Brenda', 'Moss', 'Brenda Moss', 'UNREPORTED', false, false, false, false, 'deploy', '2020-11-12T07:48:05', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000035, 'USERNAME', 'bmoss33', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000035, 5000035);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000033, 'USER', 'VT', 'bmoss33', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000033, 6000035);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000105, 1000033, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000106, 1000033, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000107, 1000033, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000035, 1000033, 'bmoss33', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000035, 5000035);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000035, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000035, 8000035);

-- Adding user: jwilcox34 (UID: 1000034)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000036, 'John', 'Wilcox', 'John Wilcox', 'UNREPORTED', false, false, false, false, 'deploy', '2022-10-17T00:10:47', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000036, 'USERNAME', 'jwilcox34', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000036, 5000036);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000034, 'USER', 'VT', 'jwilcox34', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000034, 6000036);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000108, 1000034, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000109, 1000034, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000110, 1000034, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000036, 1000034, 'jwilcox34', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000036, 5000036);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000036, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000036, 8000036);

-- Adding user: clloyd35 (UID: 1000035)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000037, 'Christopher', 'Lloyd', 'Christopher Lloyd', 'UNREPORTED', false, false, false, false, 'deploy', '2023-09-15T03:44:24', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000037, 'USERNAME', 'clloyd35', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000037, 5000037);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000035, 'USER', 'VT', 'clloyd35', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000035, 6000037);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000111, 1000035, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000112, 1000035, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000113, 1000035, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000037, 1000035, 'clloyd35', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000037, 5000037);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000037, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000037, 8000037);

-- Adding user: nreed36 (UID: 1000036)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000038, 'Nicholas', 'Reed', 'Nicholas Reed', 'UNREPORTED', false, false, false, false, 'deploy', '2023-12-27T18:42:23', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000038, 'USERNAME', 'nreed36', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000038, 5000038);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000036, 'USER', 'VT', 'nreed36', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000036, 6000038);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000114, 1000036, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000115, 1000036, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000116, 1000036, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000038, 1000036, 'nreed36', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000038, 5000038);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000038, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000038, 8000038);

-- Adding user: cdrake37 (UID: 1000037)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000039, 'Christopher', 'Drake', 'Christopher Drake', 'UNREPORTED', false, false, false, false, 'deploy', '2024-03-07T04:11:28', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000039, 'USERNAME', 'cdrake37', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000039, 5000039);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000037, 'USER', 'VT', 'cdrake37', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000037, 6000039);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000117, 1000037, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000118, 1000037, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000119, 1000037, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000039, 1000037, 'cdrake37', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000039, 5000039);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000039, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000039, 8000039);

-- Adding user: dtorres38 (UID: 1000038)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000040, 'Daniel', 'Torres', 'Daniel Torres', 'UNREPORTED', false, false, false, false, 'deploy', '2022-05-05T22:46:26', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000040, 'USERNAME', 'dtorres38', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000040, 5000040);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000038, 'USER', 'VT', 'dtorres38', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000038, 6000040);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000120, 1000038, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000121, 1000038, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000122, 1000038, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000040, 1000038, 'dtorres38', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000040, 5000040);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000040, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000040, 8000040);

-- Adding user: skelly39 (UID: 1000039)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000041, 'Susan', 'Kelly', 'Susan Kelly', 'UNREPORTED', false, false, false, false, 'deploy', '2020-07-01T17:31:02', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000041, 'USERNAME', 'skelly39', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000041, 5000041);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000039, 'USER', 'VT', 'skelly39', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000039, 6000041);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000123, 1000039, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000124, 1000039, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000125, 1000039, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000041, 1000039, 'skelly39', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000041, 5000041);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000041, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000041, 8000041);

-- Adding user: danderson40 (UID: 1000040)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000042, 'Diana', 'Anderson', 'Diana Anderson', 'UNREPORTED', false, false, false, false, 'deploy', '2021-09-14T21:38:25', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000042, 'USERNAME', 'danderson40', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000042, 5000042);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000040, 'USER', 'VT', 'danderson40', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000040, 6000042);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000126, 1000040, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000127, 1000040, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000128, 1000040, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000042, 1000040, 'danderson40', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000042, 5000042);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000042, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000042, 8000042);

-- Adding user: ddavis41 (UID: 1000041)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000043, 'Donna', 'Davis', 'Donna Davis', 'UNREPORTED', false, false, false, false, 'deploy', '2024-02-17T10:03:49', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000043, 'USERNAME', 'ddavis41', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000043, 5000043);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000041, 'USER', 'VT', 'ddavis41', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000041, 6000043);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000129, 1000041, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000130, 1000041, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000131, 1000041, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000043, 1000041, 'ddavis41', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000043, 5000043);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000043, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000043, 8000043);

-- Adding user: jfranklin42 (UID: 1000042)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000044, 'James', 'Franklin', 'James Franklin', 'UNREPORTED', false, false, false, false, 'deploy', '2023-01-08T17:55:08', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000044, 'USERNAME', 'jfranklin42', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000044, 5000044);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000042, 'USER', 'VT', 'jfranklin42', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000042, 6000044);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000132, 1000042, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000133, 1000042, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000134, 1000042, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000044, 1000042, 'jfranklin42', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000044, 5000044);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000044, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000044, 8000044);

-- Adding user: dadams43 (UID: 1000043)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000045, 'Dylan', 'Adams', 'Dylan Adams', 'UNREPORTED', false, false, false, false, 'deploy', '2022-05-26T19:52:26', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000045, 'USERNAME', 'dadams43', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000045, 5000045);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000043, 'USER', 'VT', 'dadams43', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000043, 6000045);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000135, 1000043, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000136, 1000043, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000137, 1000043, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000045, 1000043, 'dadams43', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000045, 5000045);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000045, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000045, 8000045);

-- Adding user: dedwards44 (UID: 1000044)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000046, 'Dawn', 'Edwards', 'Dawn Edwards', 'UNREPORTED', false, false, false, false, 'deploy', '2021-07-03T07:55:30', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000046, 'USERNAME', 'dedwards44', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000046, 5000046);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000044, 'USER', 'VT', 'dedwards44', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000044, 6000046);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000138, 1000044, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000139, 1000044, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000140, 1000044, 'VT_FACULTY', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000046, 1000044, 'dedwards44', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000046, 5000046);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000046, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000046, 8000046);

-- Adding user: eboyle45 (UID: 1000045)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000047, 'Erin', 'Boyle', 'Erin Boyle', 'UNREPORTED', false, false, false, false, 'deploy', '2024-01-20T01:23:51', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000047, 'USERNAME', 'eboyle45', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000047, 5000047);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000045, 'USER', 'VT', 'eboyle45', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000045, 6000047);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000141, 1000045, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000142, 1000045, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000143, 1000045, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000047, 1000045, 'eboyle45', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000047, 5000047);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000047, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000047, 8000047);

-- Adding user: cgibson46 (UID: 1000046)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000048, 'Charles', 'Gibson', 'Charles Gibson', 'UNREPORTED', false, false, false, false, 'deploy', '2021-12-03T02:26:59', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000048, 'USERNAME', 'cgibson46', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000048, 5000048);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000046, 'USER', 'VT', 'cgibson46', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000046, 6000048);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000144, 1000046, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000145, 1000046, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000146, 1000046, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000048, 1000046, 'cgibson46', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000048, 5000048);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000048, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000048, 8000048);

-- Adding user: jmonroe47 (UID: 1000047)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000049, 'Joseph', 'Monroe', 'Joseph Monroe', 'UNREPORTED', false, false, false, false, 'deploy', '2020-08-25T14:16:46', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000049, 'USERNAME', 'jmonroe47', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000049, 5000049);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000047, 'USER', 'VT', 'jmonroe47', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000047, 6000049);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000147, 1000047, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000148, 1000047, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000149, 1000047, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000049, 1000047, 'jmonroe47', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000049, 5000049);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000049, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000049, 8000049);

-- Adding user: bharvey48 (UID: 1000048)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000050, 'Brian', 'Harvey', 'Brian Harvey', 'UNREPORTED', false, false, false, false, 'deploy', '2021-09-13T13:38:54', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000050, 'USERNAME', 'bharvey48', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000050, 5000050);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000048, 'USER', 'VT', 'bharvey48', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000048, 6000050);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000150, 1000048, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000151, 1000048, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000152, 1000048, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000050, 1000048, 'bharvey48', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000050, 5000050);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000050, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000050, 8000050);

-- Adding user: mparker49 (UID: 1000049)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000051, 'Monica', 'Parker', 'Monica Parker', 'UNREPORTED', false, false, false, false, 'deploy', '2023-05-16T18:43:52', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000051, 'USERNAME', 'mparker49', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000051, 5000051);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (1000049, 'USER', 'VT', 'mparker49', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (1000049, 6000051);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000153, 1000049, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000154, 1000049, 'VT_EMPLOYEE_STATE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000155, 1000049, 'VT_STAFF', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000051, 1000049, 'mparker49', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000051, 5000051);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000051, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000051, 8000051);

-- Adding user: cnelson50 (UID: 2000000)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000052, 'Cheryl', 'Nelson', 'Cheryl Nelson', 'UNREPORTED', false, false, false, false, 'deploy', '2020-03-21T02:50:10', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000052, 'USERNAME', 'cnelson50', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000052, 5000052);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000000, 'USER', 'VT', 'cnelson50', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000000, 6000052);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000156, 2000000, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000157, 2000000, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000158, 2000000, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000052, 2000000, 'cnelson50', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000052, 5000052);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000052, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000052, 8000052);

-- Adding user: ashah51 (UID: 2000001)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000053, 'Angel', 'Shah', 'Angel Shah', 'UNREPORTED', false, false, false, false, 'deploy', '2022-01-01T19:42:14', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000053, 'USERNAME', 'ashah51', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000053, 5000053);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000001, 'USER', 'VT', 'ashah51', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000001, 6000053);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000159, 2000001, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000160, 2000001, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000161, 2000001, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000053, 2000001, 'ashah51', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000053, 5000053);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000053, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000053, 8000053);

-- Adding user: mperez52 (UID: 2000002)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000054, 'Margaret', 'Perez', 'Margaret Perez', 'UNREPORTED', false, false, false, false, 'deploy', '2020-09-22T10:34:18', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000054, 'USERNAME', 'mperez52', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000054, 5000054);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000002, 'USER', 'VT', 'mperez52', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000002, 6000054);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000162, 2000002, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000163, 2000002, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000164, 2000002, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000054, 2000002, 'mperez52', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000054, 5000054);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000054, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000054, 8000054);

-- Adding user: jhudson53 (UID: 2000003)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000055, 'Jennifer', 'Hudson', 'Jennifer Hudson', 'UNREPORTED', false, false, false, false, 'deploy', '2023-08-26T19:36:58', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000055, 'USERNAME', 'jhudson53', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000055, 5000055);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000003, 'USER', 'VT', 'jhudson53', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000003, 6000055);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000165, 2000003, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000166, 2000003, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000167, 2000003, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000055, 2000003, 'jhudson53', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000055, 5000055);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000055, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000055, 8000055);

-- Adding user: kford54 (UID: 2000004)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000056, 'Kimberly', 'Ford', 'Kimberly Ford', 'UNREPORTED', false, false, false, false, 'deploy', '2022-10-17T10:29:48', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000056, 'USERNAME', 'kford54', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000056, 5000056);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000004, 'USER', 'VT', 'kford54', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000004, 6000056);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000168, 2000004, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000169, 2000004, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000170, 2000004, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000056, 2000004, 'kford54', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000056, 5000056);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000056, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000056, 8000056);

-- Adding user: vferguson55 (UID: 2000005)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000057, 'Veronica', 'Ferguson', 'Veronica Ferguson', 'UNREPORTED', false, false, false, false, 'deploy', '2021-05-05T03:39:37', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000057, 'USERNAME', 'vferguson55', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000057, 5000057);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000005, 'USER', 'VT', 'vferguson55', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000005, 6000057);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000171, 2000005, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000172, 2000005, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000173, 2000005, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000057, 2000005, 'vferguson55', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000057, 5000057);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000057, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000057, 8000057);

-- Adding user: mcraig56 (UID: 2000006)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000058, 'Meghan', 'Craig', 'Meghan Craig', 'UNREPORTED', false, false, false, false, 'deploy', '2022-11-24T15:14:03', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000058, 'USERNAME', 'mcraig56', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000058, 5000058);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000006, 'USER', 'VT', 'mcraig56', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000006, 6000058);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000174, 2000006, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000175, 2000006, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000176, 2000006, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000058, 2000006, 'mcraig56', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000058, 5000058);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000058, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000058, 8000058);

-- Adding user: ygray57 (UID: 2000007)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000059, 'Yvette', 'Gray', 'Yvette Gray', 'UNREPORTED', false, false, false, false, 'deploy', '2023-09-02T23:54:49', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000059, 'USERNAME', 'ygray57', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000059, 5000059);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000007, 'USER', 'VT', 'ygray57', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000007, 6000059);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000177, 2000007, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000178, 2000007, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000179, 2000007, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000059, 2000007, 'ygray57', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000059, 5000059);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000059, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000059, 8000059);

-- Adding user: pwagner58 (UID: 2000008)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000060, 'Paul', 'Wagner', 'Paul Wagner', 'UNREPORTED', false, false, false, false, 'deploy', '2021-02-26T20:21:16', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000060, 'USERNAME', 'pwagner58', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000060, 5000060);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000008, 'USER', 'VT', 'pwagner58', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000008, 6000060);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000180, 2000008, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000181, 2000008, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000182, 2000008, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000060, 2000008, 'pwagner58', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000060, 5000060);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000060, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000060, 8000060);

-- Adding user: sperez59 (UID: 2000009)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000061, 'Scott', 'Perez', 'Scott Perez', 'UNREPORTED', false, false, false, false, 'deploy', '2023-04-28T17:04:32', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000061, 'USERNAME', 'sperez59', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000061, 5000061);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000009, 'USER', 'VT', 'sperez59', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000009, 6000061);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000183, 2000009, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000184, 2000009, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000185, 2000009, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000061, 2000009, 'sperez59', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000061, 5000061);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000061, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000061, 8000061);

-- Adding user: jjackson60 (UID: 2000010)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000062, 'Jillian', 'Jackson', 'Jillian Jackson', 'UNREPORTED', false, false, false, false, 'deploy', '2020-08-16T07:47:08', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000062, 'USERNAME', 'jjackson60', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000062, 5000062);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000010, 'USER', 'VT', 'jjackson60', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000010, 6000062);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000186, 2000010, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000187, 2000010, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000188, 2000010, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000062, 2000010, 'jjackson60', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000062, 5000062);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000062, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000062, 8000062);

-- Adding user: girwin61 (UID: 2000011)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000063, 'George', 'Irwin', 'George Irwin', 'UNREPORTED', false, false, false, false, 'deploy', '2023-07-25T00:31:50', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000063, 'USERNAME', 'girwin61', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000063, 5000063);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000011, 'USER', 'VT', 'girwin61', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000011, 6000063);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000189, 2000011, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000190, 2000011, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000191, 2000011, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000063, 2000011, 'girwin61', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000063, 5000063);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000063, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000063, 8000063);

-- Adding user: mvelazquez62 (UID: 2000012)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000064, 'Morgan', 'Velazquez', 'Morgan Velazquez', 'UNREPORTED', false, false, false, false, 'deploy', '2020-06-28T17:55:38', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000064, 'USERNAME', 'mvelazquez62', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000064, 5000064);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000012, 'USER', 'VT', 'mvelazquez62', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000012, 6000064);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000192, 2000012, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000193, 2000012, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000194, 2000012, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000064, 2000012, 'mvelazquez62', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000064, 5000064);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000064, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000064, 8000064);

-- Adding user: cjones63 (UID: 2000013)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000065, 'Connie', 'Jones', 'Connie Jones', 'UNREPORTED', false, false, false, false, 'deploy', '2024-03-01T18:50:46', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000065, 'USERNAME', 'cjones63', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000065, 5000065);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000013, 'USER', 'VT', 'cjones63', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000013, 6000065);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000195, 2000013, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000196, 2000013, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000197, 2000013, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000065, 2000013, 'cjones63', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000065, 5000065);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000065, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000065, 8000065);

-- Adding user: smendoza64 (UID: 2000014)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000066, 'Stephen', 'Mendoza', 'Stephen Mendoza', 'UNREPORTED', false, false, false, false, 'deploy', '2020-12-02T03:32:46', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000066, 'USERNAME', 'smendoza64', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000066, 5000066);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000014, 'USER', 'VT', 'smendoza64', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000014, 6000066);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000198, 2000014, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000199, 2000014, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000200, 2000014, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000066, 2000014, 'smendoza64', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000066, 5000066);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000066, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000066, 8000066);

-- Adding user: kdavis65 (UID: 2000015)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000067, 'Kyle', 'Davis', 'Kyle Davis', 'UNREPORTED', false, false, false, false, 'deploy', '2024-06-22T17:12:19', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000067, 'USERNAME', 'kdavis65', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000067, 5000067);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000015, 'USER', 'VT', 'kdavis65', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000015, 6000067);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000201, 2000015, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000202, 2000015, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000203, 2000015, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000067, 2000015, 'kdavis65', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000067, 5000067);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000067, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000067, 8000067);

-- Adding user: efleming66 (UID: 2000016)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000068, 'Eric', 'Fleming', 'Eric Fleming', 'UNREPORTED', false, false, false, false, 'deploy', '2020-11-18T19:15:31', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000068, 'USERNAME', 'efleming66', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000068, 5000068);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000016, 'USER', 'VT', 'efleming66', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000016, 6000068);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000204, 2000016, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000205, 2000016, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000206, 2000016, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000068, 2000016, 'efleming66', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000068, 5000068);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000068, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000068, 8000068);

-- Adding user: hhughes67 (UID: 2000017)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000069, 'Henry', 'Hughes', 'Henry Hughes', 'UNREPORTED', false, false, false, false, 'deploy', '2021-06-28T18:20:45', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000069, 'USERNAME', 'hhughes67', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000069, 5000069);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000017, 'USER', 'VT', 'hhughes67', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000017, 6000069);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000207, 2000017, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000208, 2000017, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000209, 2000017, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000069, 2000017, 'hhughes67', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000069, 5000069);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000069, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000069, 8000069);

-- Adding user: srichardson68 (UID: 2000018)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000070, 'Susan', 'Richardson', 'Susan Richardson', 'UNREPORTED', false, false, false, false, 'deploy', '2021-12-15T20:19:17', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000070, 'USERNAME', 'srichardson68', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000070, 5000070);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000018, 'USER', 'VT', 'srichardson68', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000018, 6000070);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000210, 2000018, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000211, 2000018, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000212, 2000018, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000070, 2000018, 'srichardson68', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000070, 5000070);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000070, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000070, 8000070);

-- Adding user: pdiaz69 (UID: 2000019)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000071, 'Pamela', 'Diaz', 'Pamela Diaz', 'UNREPORTED', false, false, false, false, 'deploy', '2022-01-29T18:50:51', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000071, 'USERNAME', 'pdiaz69', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000071, 5000071);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000019, 'USER', 'VT', 'pdiaz69', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000019, 6000071);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000213, 2000019, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000214, 2000019, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000215, 2000019, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000071, 2000019, 'pdiaz69', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000071, 5000071);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000071, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000071, 8000071);

-- Adding user: lharrison70 (UID: 2000020)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000072, 'Leslie', 'Harrison', 'Leslie Harrison', 'UNREPORTED', false, false, false, false, 'deploy', '2021-04-13T20:52:58', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000072, 'USERNAME', 'lharrison70', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000072, 5000072);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000020, 'USER', 'VT', 'lharrison70', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000020, 6000072);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000216, 2000020, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000217, 2000020, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000218, 2000020, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000072, 2000020, 'lharrison70', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000072, 5000072);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000072, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000072, 8000072);

-- Adding user: djones71 (UID: 2000021)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000073, 'Debbie', 'Jones', 'Debbie Jones', 'UNREPORTED', false, false, false, false, 'deploy', '2022-05-26T10:45:01', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000073, 'USERNAME', 'djones71', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000073, 5000073);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000021, 'USER', 'VT', 'djones71', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000021, 6000073);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000219, 2000021, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000220, 2000021, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000221, 2000021, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000073, 2000021, 'djones71', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000073, 5000073);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000073, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000073, 8000073);

-- Adding user: jboyd72 (UID: 2000022)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000074, 'Joanna', 'Boyd', 'Joanna Boyd', 'UNREPORTED', false, false, false, false, 'deploy', '2023-05-11T19:00:56', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000074, 'USERNAME', 'jboyd72', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000074, 5000074);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000022, 'USER', 'VT', 'jboyd72', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000022, 6000074);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000222, 2000022, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000223, 2000022, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000224, 2000022, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000074, 2000022, 'jboyd72', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000074, 5000074);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000074, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000074, 8000074);

-- Adding user: jallen73 (UID: 2000023)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000075, 'John', 'Allen', 'John Allen', 'UNREPORTED', false, false, false, false, 'deploy', '2021-05-01T00:49:55', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000075, 'USERNAME', 'jallen73', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000075, 5000075);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000023, 'USER', 'VT', 'jallen73', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000023, 6000075);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000225, 2000023, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000226, 2000023, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000227, 2000023, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000075, 2000023, 'jallen73', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000075, 5000075);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000075, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000075, 8000075);

-- Adding user: jcarroll74 (UID: 2000024)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000076, 'John', 'Carroll', 'John Carroll', 'UNREPORTED', false, false, false, false, 'deploy', '2022-06-27T07:28:20', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000076, 'USERNAME', 'jcarroll74', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000076, 5000076);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000024, 'USER', 'VT', 'jcarroll74', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000024, 6000076);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000228, 2000024, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000229, 2000024, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000230, 2000024, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000076, 2000024, 'jcarroll74', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000076, 5000076);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000076, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000076, 8000076);

-- Adding user: ssexton75 (UID: 2000025)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000077, 'Shannon', 'Sexton', 'Shannon Sexton', 'UNREPORTED', false, false, false, false, 'deploy', '2024-04-04T12:30:32', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000077, 'USERNAME', 'ssexton75', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000077, 5000077);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000025, 'USER', 'VT', 'ssexton75', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000025, 6000077);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000231, 2000025, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000232, 2000025, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000233, 2000025, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000077, 2000025, 'ssexton75', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000077, 5000077);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000077, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000077, 8000077);

-- Adding user: maguilar76 (UID: 2000026)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000078, 'Michael', 'Aguilar', 'Michael Aguilar', 'UNREPORTED', false, false, false, false, 'deploy', '2023-02-10T14:02:48', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000078, 'USERNAME', 'maguilar76', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000078, 5000078);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000026, 'USER', 'VT', 'maguilar76', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000026, 6000078);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000234, 2000026, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000235, 2000026, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000236, 2000026, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000078, 2000026, 'maguilar76', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000078, 5000078);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000078, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000078, 8000078);

-- Adding user: lchristian77 (UID: 2000027)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000079, 'Luis', 'Christian', 'Luis Christian', 'UNREPORTED', false, false, false, false, 'deploy', '2021-07-23T04:04:52', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000079, 'USERNAME', 'lchristian77', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000079, 5000079);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000027, 'USER', 'VT', 'lchristian77', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000027, 6000079);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000237, 2000027, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000238, 2000027, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000239, 2000027, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000079, 2000027, 'lchristian77', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000079, 5000079);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000079, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000079, 8000079);

-- Adding user: tcain78 (UID: 2000028)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000080, 'Tanya', 'Cain', 'Tanya Cain', 'UNREPORTED', false, false, false, false, 'deploy', '2021-10-30T13:34:32', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000080, 'USERNAME', 'tcain78', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000080, 5000080);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000028, 'USER', 'VT', 'tcain78', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000028, 6000080);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000240, 2000028, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000241, 2000028, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000242, 2000028, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000080, 2000028, 'tcain78', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000080, 5000080);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000080, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000080, 8000080);

-- Adding user: gfowler79 (UID: 2000029)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000081, 'Gary', 'Fowler', 'Gary Fowler', 'UNREPORTED', false, false, false, false, 'deploy', '2022-02-27T12:17:18', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000081, 'USERNAME', 'gfowler79', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000081, 5000081);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000029, 'USER', 'VT', 'gfowler79', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000029, 6000081);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000243, 2000029, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000244, 2000029, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000245, 2000029, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000081, 2000029, 'gfowler79', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000081, 5000081);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000081, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000081, 8000081);

-- Adding user: tperez80 (UID: 2000030)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000082, 'Tim', 'Perez', 'Tim Perez', 'UNREPORTED', false, false, false, false, 'deploy', '2020-08-30T10:24:16', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000082, 'USERNAME', 'tperez80', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000082, 5000082);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000030, 'USER', 'VT', 'tperez80', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000030, 6000082);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000246, 2000030, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000247, 2000030, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000248, 2000030, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000082, 2000030, 'tperez80', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000082, 5000082);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000082, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000082, 8000082);

-- Adding user: nsherman81 (UID: 2000031)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000083, 'Nicole', 'Sherman', 'Nicole Sherman', 'UNREPORTED', false, false, false, false, 'deploy', '2023-10-08T08:43:18', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000083, 'USERNAME', 'nsherman81', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000083, 5000083);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000031, 'USER', 'VT', 'nsherman81', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000031, 6000083);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000249, 2000031, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000250, 2000031, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000251, 2000031, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000083, 2000031, 'nsherman81', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000083, 5000083);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000083, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000083, 8000083);

-- Adding user: dwells82 (UID: 2000032)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000084, 'Deborah', 'Wells', 'Deborah Wells', 'UNREPORTED', false, false, false, false, 'deploy', '2021-11-03T14:40:18', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000084, 'USERNAME', 'dwells82', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000084, 5000084);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000032, 'USER', 'VT', 'dwells82', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000032, 6000084);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000252, 2000032, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000253, 2000032, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000254, 2000032, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000084, 2000032, 'dwells82', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000084, 5000084);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000084, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000084, 8000084);

-- Adding user: lbrown83 (UID: 2000033)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000085, 'Lance', 'Brown', 'Lance Brown', 'UNREPORTED', false, false, false, false, 'deploy', '2020-09-30T00:11:05', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000085, 'USERNAME', 'lbrown83', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000085, 5000085);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000033, 'USER', 'VT', 'lbrown83', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000033, 6000085);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000255, 2000033, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000256, 2000033, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000257, 2000033, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000085, 2000033, 'lbrown83', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000085, 5000085);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000085, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000085, 8000085);

-- Adding user: tcox84 (UID: 2000034)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000086, 'Thomas', 'Cox', 'Thomas Cox', 'UNREPORTED', false, false, false, false, 'deploy', '2023-05-12T16:16:52', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000086, 'USERNAME', 'tcox84', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000086, 5000086);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000034, 'USER', 'VT', 'tcox84', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000034, 6000086);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000258, 2000034, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000259, 2000034, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000260, 2000034, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000086, 2000034, 'tcox84', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000086, 5000086);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000086, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000086, 8000086);

-- Adding user: khicks85 (UID: 2000035)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000087, 'Kevin', 'Hicks', 'Kevin Hicks', 'UNREPORTED', false, false, false, false, 'deploy', '2021-10-09T22:11:24', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000087, 'USERNAME', 'khicks85', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000087, 5000087);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000035, 'USER', 'VT', 'khicks85', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000035, 6000087);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000261, 2000035, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000262, 2000035, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000263, 2000035, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000087, 2000035, 'khicks85', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000087, 5000087);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000087, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000087, 8000087);

-- Adding user: jbutler86 (UID: 2000036)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000088, 'Jonathan', 'Butler', 'Jonathan Butler', 'UNREPORTED', false, false, false, false, 'deploy', '2022-02-24T02:01:38', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000088, 'USERNAME', 'jbutler86', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000088, 5000088);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000036, 'USER', 'VT', 'jbutler86', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000036, 6000088);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000264, 2000036, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000265, 2000036, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000266, 2000036, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000088, 2000036, 'jbutler86', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000088, 5000088);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000088, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000088, 8000088);

-- Adding user: rbentley87 (UID: 2000037)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000089, 'Robert', 'Bentley', 'Robert Bentley', 'UNREPORTED', false, false, false, false, 'deploy', '2020-07-01T02:11:42', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000089, 'USERNAME', 'rbentley87', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000089, 5000089);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000037, 'USER', 'VT', 'rbentley87', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000037, 6000089);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000267, 2000037, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000268, 2000037, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000269, 2000037, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000089, 2000037, 'rbentley87', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000089, 5000089);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000089, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000089, 8000089);

-- Adding user: kwilliams88 (UID: 2000038)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000090, 'Kyle', 'Williams', 'Kyle Williams', 'UNREPORTED', false, false, false, false, 'deploy', '2023-02-04T21:16:40', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000090, 'USERNAME', 'kwilliams88', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000090, 5000090);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000038, 'USER', 'VT', 'kwilliams88', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000038, 6000090);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000270, 2000038, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000271, 2000038, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000272, 2000038, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000090, 2000038, 'kwilliams88', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000090, 5000090);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000090, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000090, 8000090);

-- Adding user: cwhitehead89 (UID: 2000039)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000091, 'Charles', 'Whitehead', 'Charles Whitehead', 'UNREPORTED', false, false, false, false, 'deploy', '2024-06-05T07:22:58', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000091, 'USERNAME', 'cwhitehead89', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000091, 5000091);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000039, 'USER', 'VT', 'cwhitehead89', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000039, 6000091);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000273, 2000039, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000274, 2000039, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000275, 2000039, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000091, 2000039, 'cwhitehead89', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000091, 5000091);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000091, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000091, 8000091);

-- Adding user: ecameron90 (UID: 2000040)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000092, 'Ebony', 'Cameron', 'Ebony Cameron', 'UNREPORTED', false, false, false, false, 'deploy', '2024-05-01T08:25:31', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000092, 'USERNAME', 'ecameron90', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000092, 5000092);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000040, 'USER', 'VT', 'ecameron90', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000040, 6000092);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000276, 2000040, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000277, 2000040, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000278, 2000040, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000092, 2000040, 'ecameron90', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000092, 5000092);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000092, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000092, 8000092);

-- Adding user: bhernandez91 (UID: 2000041)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000093, 'Brittany', 'Hernandez', 'Brittany Hernandez', 'UNREPORTED', false, false, false, false, 'deploy', '2023-11-27T17:59:06', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000093, 'USERNAME', 'bhernandez91', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000093, 5000093);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000041, 'USER', 'VT', 'bhernandez91', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000041, 6000093);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000279, 2000041, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000280, 2000041, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000281, 2000041, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000093, 2000041, 'bhernandez91', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000093, 5000093);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000093, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000093, 8000093);

-- Adding user: kholden92 (UID: 2000042)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000094, 'Karen', 'Holden', 'Karen Holden', 'UNREPORTED', false, false, false, false, 'deploy', '2024-05-19T20:16:39', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000094, 'USERNAME', 'kholden92', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000094, 5000094);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000042, 'USER', 'VT', 'kholden92', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000042, 6000094);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000282, 2000042, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000283, 2000042, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000284, 2000042, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000094, 2000042, 'kholden92', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000094, 5000094);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000094, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000094, 8000094);

-- Adding user: jcampbell93 (UID: 2000043)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000095, 'Jodi', 'Campbell', 'Jodi Campbell', 'UNREPORTED', false, false, false, false, 'deploy', '2023-09-26T15:23:00', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000095, 'USERNAME', 'jcampbell93', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000095, 5000095);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000043, 'USER', 'VT', 'jcampbell93', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000043, 6000095);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000285, 2000043, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000286, 2000043, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000287, 2000043, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000095, 2000043, 'jcampbell93', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000095, 5000095);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000095, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000095, 8000095);

-- Adding user: kgomez94 (UID: 2000044)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000096, 'Kristine', 'Gomez', 'Kristine Gomez', 'UNREPORTED', false, false, false, false, 'deploy', '2021-06-11T03:28:29', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000096, 'USERNAME', 'kgomez94', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000096, 5000096);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000044, 'USER', 'VT', 'kgomez94', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000044, 6000096);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000288, 2000044, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000289, 2000044, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000290, 2000044, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000096, 2000044, 'kgomez94', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000096, 5000096);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000096, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000096, 8000096);

-- Adding user: jrogers95 (UID: 2000045)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000097, 'James', 'Rogers', 'James Rogers', 'UNREPORTED', false, false, false, false, 'deploy', '2023-03-19T20:35:00', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000097, 'USERNAME', 'jrogers95', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000097, 5000097);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000045, 'USER', 'VT', 'jrogers95', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000045, 6000097);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000291, 2000045, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000292, 2000045, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000293, 2000045, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000097, 2000045, 'jrogers95', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000097, 5000097);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000097, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000097, 8000097);

-- Adding user: kthompson96 (UID: 2000046)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000098, 'Kaitlin', 'Thompson', 'Kaitlin Thompson', 'UNREPORTED', false, false, false, false, 'deploy', '2024-07-09T22:23:13', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000098, 'USERNAME', 'kthompson96', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000098, 5000098);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000046, 'USER', 'VT', 'kthompson96', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000046, 6000098);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000294, 2000046, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000295, 2000046, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000296, 2000046, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000098, 2000046, 'kthompson96', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000098, 5000098);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000098, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000098, 8000098);

-- Adding user: lgamble97 (UID: 2000047)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000099, 'Leslie', 'Gamble', 'Leslie Gamble', 'UNREPORTED', false, false, false, false, 'deploy', '2022-09-14T14:25:15', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000099, 'USERNAME', 'lgamble97', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000099, 5000099);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000047, 'USER', 'VT', 'lgamble97', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000047, 6000099);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000297, 2000047, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000298, 2000047, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000299, 2000047, 'VT_STUDENT_ENROLLED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000099, 2000047, 'lgamble97', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000099, 5000099);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000099, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000099, 8000099);

-- Adding user: scollins98 (UID: 2000048)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000100, 'Shelly', 'Collins', 'Shelly Collins', 'UNREPORTED', false, false, false, false, 'deploy', '2024-05-01T05:43:13', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000100, 'USERNAME', 'scollins98', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000100, 5000100);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000048, 'USER', 'VT', 'scollins98', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000048, 6000100);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000300, 2000048, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000301, 2000048, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000302, 2000048, 'VT_STUDENT_RECENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000100, 2000048, 'scollins98', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000100, 5000100);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000100, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000100, 8000100);

-- Adding user: kdaniels99 (UID: 2000049)
INSERT INTO person (id, first_name, last_name, display_name, gender, deceased, employee_confidential, student_confidential, suppress_all, created_by, created_date, version) VALUES (6000101, 'Kenneth', 'Daniels', 'Kenneth Daniels', 'UNREPORTED', false, false, false, false, 'deploy', '2020-07-20T18:32:14', 1);
INSERT INTO identifier (seqno, namespace, value, created_by, created_date, version) VALUES (5000101, 'USERNAME', 'kdaniels99', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO person_to_identifier (person_id, identifier_seqno) VALUES (6000101, 5000101);
INSERT INTO subject (id, dtype, typ, name, assurance, created_by, created_date, version) VALUES (2000049, 'USER', 'VT', 'kdaniels99', 'HIGH', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_ (id, person_id) VALUES (2000049, 6000101);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000303, 2000049, 'VT_ACTIVE_MEMBER', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000304, 2000049, 'VT_STUDENT', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO user_affiliation (seqno, user_id, affiliation, created_by, created_date, version) VALUES (9000305, 2000049, 'VT_STUDENT_FUTURE', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account (id, owner_id, identifier, state, call_4help, created_by, created_date, version) VALUES (7000101, 2000049, 'kdaniels99', 'ACTIVE', false, 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_identifier (account_id, identifier_seqno) VALUES (7000101, 5000101);
INSERT INTO transition (seqno, date, type, created_by, created_date, version) VALUES (8000101, '2024-07-17T13:44:49', 'CREATED', 'deploy', '2024-07-18T13:44:49', 1);
INSERT INTO account_to_prev_transition (account_id, transition_seqno) VALUES (7000101, 8000101);


```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/registry/scripts/20-midPoint-service.sql

```typescript
-- noinspection SqlNoDataSourceInspectionForFile

/* midPoint service */
DO $$
DECLARE
  account_uid account.id%TYPE;
    cert_seqno certificate.seqno%TYPE;
    entitlement_id_start entitlement.id%TYPE := 91234561;
    entitlement_id_end entitlement.id%TYPE := 91234566;
    id_seqno identifier.seqno%TYPE;
    padmin_uid subject.id%TYPE := 3000000;
    pcontact_uid subject.id%TYPE := 3000001;
    prev_trans_seqno transition.seqno%TYPE;
    service_uid subject.id%TYPE := 9123456;
    attr_seqno attribute.seqno%TYPE;
BEGIN
  insert into subject(id, dtype, typ, name, assurance, created_by, created_date, version)
  values(service_uid, 'SERVICE', 'SERVICE', 'midpoint', 'HIGH', 'deploy', current_timestamp, 1);

  insert into service(id, integration_context)
  values(service_uid, 'BASE');

  insert into identifier(seqno, namespace, value, created_by, created_date, version)
  values(nextval('identifier_seq'), 'USERNAME', 'midpoint', 'deploy', current_timestamp, 1) returning seqno into id_seqno;

  insert into service_to_identifier(service_id, identifier_seqno)
  values(service_uid, id_seqno);

  insert into account(id, owner_id, identifier, state, max_expiration, call_4help, created_by, created_date, version)
  values(nextval('uid_number_seq'), service_uid, 'midpoint', 'ACTIVE', 'P2Y30D', false, 'deploy', current_timestamp, 1) returning id into account_uid;

  insert into account_to_identifier(account_id, identifier_seqno)
  values(account_uid, id_seqno);

  insert into transition(seqno, date, type, created_by, created_date, version)
  values(nextval('transition_seq'), current_timestamp - interval '1 day', 'CREATED', 'deploy', current_timestamp, 1) returning seqno into prev_trans_seqno;

  insert into account_to_prev_transition(account_id, transition_seqno)
  values(account_uid, prev_trans_seqno);

  /* Get the encoded cert value by executing local-env/src/test/docker/vault/etc/gen-registry-cert-encoded-value.sh */
  insert into certificate(seqno, typ, dn, encoded, created_by, created_date, expiration, version)
  values(nextval('certificate_seq'), 'X509', 'DC=edu, DC=vt, DC=iam, CN=midpoint', 'H4sIAJWom2YAAzNoYsszaGINW8DMxMjEJKKa8Lvs74dk7b/ri7I4/ErXmKrYRRjwsnFqtXm0fedlZORmZTBoYlQwFDTgZ2MOZWEW5sjNTCnIz8wrMTQw0AMJsQqrGxobmpiZW5oam5tYWFoYGBuYmBmbmJoaG1iamJubmZuYWZgYm5qYGSoayIN0cAtLBKcmlxalKnimpOaVZJZUKgSnFpVlJqcWG0oZSECUCPpmpqTkpJYnFqXqOudkAtUZ2hhYgeS4hI3DMovSM/MyExUC8nMqS1KTM/IykxU884qBZpWWpCok5qUoBJckAlmheZllqUXFQCsMhQ0EQbrZhbmcchKTs4uTSovSYd7iEOaAGWkoZCDAxsU5Sa1z8iedFEZJMaayErBeZDHm1JRSQ24DTpBeNmGm0GADOXFeIxMDcyMDQyMDM2PzKHFeYyDX0ALKHQ1DIsKwiVEJOekxsjIwNzHyg9IfF1MTIyPDlZDj3pwHteSlKmL3F/FfCyrzLp4Wc7JnalPKvQ8ileK1cfG1+4zCTzMc2n/k+qPll5hjpRuTbBsnBmy5zPG27l1QgsOi11c11zA5tR36t3/lNQnH8rXzfI/FbluyV5Cf3YpR7nX3OpH539e/m7v1nrxFVsW/JW3tx5P2nz6TtV7shoju3xf7fr7O2h0xO+VZ55wEza6COSJif/ZuXJbwcopjXdMUiZxNk2eJbxMMyAt5+uWEa19qZcWF6k2/ReOahKv+2KhudZ0Y7+GouOC+1HyuGRpuKzQSP5pMdKqW7zpWukRmto5AxZPp/s9ezLg//5Kl64rQK6F3d99TkDxUbScz4WZ4z0Tbx6+cvmesZ2JmZGBc3MQ4Cxgi0wxkgQEny8cixiIimDDnw4beUyGrls6Skgv2mWWYUGEJVJIKUqDM0sQYA+RENGBVtrCJUWNJE6PKaPoknD6bsBeWPKBgFmZhNWBmZPyPVnQyg5LtJa/tk1meMP2Ys/3rqcUfksqtfL5v85plOafmIfu52FUvZ37551NUNj3xU17Ec/5SraBLu8802k64FK3Z7CqmrzD1lL/Erdvzrzkbx2Uvvfj5nN3TE0YNdckc9h8/+3J/q9HrY1TYPz3LK33hLK3YW0pbH95guuLhU+Via2JvVKXVtcIxeef7mTsdpZftvXNRUlRT5UjFDp55MZuvNqufjYg7fcTtiUpFXhS7lLX9nJZIj32GbvsmtU6ffK3lww6VTXNyS849nL/ty5261PDtPDvF7h++8lnKt3L3py0LzRZLpz9tX6rx92pOTcNn8y2Nla9Cbrx68vn6rurzky50WGtda2w3q+ouPFcnsXG/JwA79twecgYAAA==', 'deploy', current_timestamp, '2034-07-16 20:48:17 +00:00', 1) returning seqno into cert_seqno;

  insert into account_to_certificate(account_id, certificate_seqno)
  values(account_uid, cert_seqno);

  insert into attribute(seqno, name, alias, created_by, created_date, version)
  values(nextval('ed.attribute_seq'), 'ALL', null, 'junit', current_timestamp, 1) returning seqno into attr_seqno;

  insert into service_to_readable_attribute(service_id, attribute_seqno)
  values(service_uid, attr_seqno);

  insert into service_rel (seqno, service_id, subject_id, role, created_by, created_date, version)
  values (nextval('ed.rel_seq'), service_uid, padmin_uid, 'ADMIN', 'deploy', current_timestamp , 1);
  insert into service_rel (seqno, service_id, subject_id, role, created_by, created_date, version)
  values (nextval('ed.rel_seq'), service_uid, pcontact_uid, 'CONTACT', 'deploy', current_timestamp , 1);

END $$

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/test-driver/01-provisioner-test.py

```typescript
#!/usr/bin/env python3

from pylib import ed
from pylib import grouper
from pylib import test
import sys
import time

PROV_TEST_STEM="provtest"

#============================
# Main
#============================
users = None
with open('user-list.txt', 'r') as f:
  users = [l.strip() for l in f.readlines()]
users.sort()
expectedMembers = users[2:12]
edJwt = ed.createJwt()
edGroup = f"{PROV_TEST_STEM}.prov-group-1"
grouperGroup = edGroup.replace('.', ':')
try:
  print(f"Creating group {grouperGroup}")
  grouper.createGroup(grouperGroup)
  print(f"Adding {expectedMembers} to {grouperGroup}")
  grouper.addMembers(grouperGroup, users[2:12])
  # Allow ample time for provisioning to occur
  # Provisioner runs every minute at 55s past the minute
  waitTime = 70
  print(f"Waiting {waitTime}s for provisioning to occur...")
  time.sleep(waitTime)
  print(f"Fetching members from {edGroup}")
  actualMembers = ed.fetchMembers(edJwt, edGroup)
  # Returned members are sorted lexicographically by default
  test.assertEquals(expectedMembers, actualMembers)
except Exception as e:
  print(e)
  sys.exit('Error caused test to abort prematurely')

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/test-driver/pylib/__init__.py

```typescript

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/test-driver/pylib/ed.py

```typescript
import jwt
import os
import requests
import time
from urllib3.exceptions import InsecureRequestWarning

"""JWT validity period in hours"""
VALIDITY_PERIOD=1

"""ED service used for REST API calls"""
SERVICE = "grouper"

"""Private key of ED service referenced above"""
PRIVATE_KEY = """
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGZKVU6k5Hyfu8
7Ml+XxDLd+BmKThUeQb59bkFFhZi3R9HU/VME6XpXXa7eh3aH2rHdXN8iKVpRRRH
CvwN1dp6T4Yqv24fdHuQTkbolBbmRSG+ng1esKYyXbfjPSoLt3BZEyCIJ6tz+E8T
/vtc1v5ImmIXsrmslJyPl7NacpX4N5q+Ph5BJhLBFITMzJ+MMsGIyeUlzkKcJyem
liP8UtqhkOxzpjfMzUswEZ3ST68lBCc2b6B3RveTVb0iBw5J3tf6fcdOjyTYqxN0
/P3xTbgY3cRzg/AibJI942qRmp50/HmUz5NgGlB/XOjyTwJu5NZbE2/tvqmkCpNJ
YEnWEgZtAgMBAAECggEAbXjt7hxYU6611TsHuE620r90OIs4RQx/eABKNu9ILQd9
EfvXGEKjQ1FKigrJXCoH3sYFkstIEv2GQeliyjOeGe21x/LXzk2VPTykTgQhWrD8
/NTz5bMuEg66wI5onAx91vkB83+IUTbMU+lYRJNxvxhJVnBNmlhqx6Va12bxMARt
2pG2kudPYDgiShh5OOpEyctU82gUyIWieop2gyiy8f/9W0Co+cx7kBH/C4qODT+y
l39yc8dwyq7hNtimFaoNyqnoZw3buu+fta8Wa/V0RI3xIBga6A/iXa1pOc2fCfbb
laQFc4zZbx/fa9q/hojBDQ6AHF7lOfl8xxSFUwk2dQKBgQDqjVZwZx4w5G8RHvte
wbUbERYtQfcTdTwFNyFz8fBvPuViUZbXl4s5oHDe0cETYs4N1tke36SY+MTh8NI4
v+hDSVXpNeyuVzKLBCspfn/oeVR9FGWH1h1oSEFpwUk4M41JJCK+BgFO3i5f99md
Rm9kaMCJ6EtVGxTbcAsV0cqOKwKBgQDYiNu4uIMkD78U3+V2KEGtt1IXw3fB02sE
iD1xOxKd02swO/9jwiuq+0hDnhGm2lh55Rzjao45v9ND/hbnhHuoJbNNpfdXpHs5
u8nO/XvMbGN4yHta/s8mdy5hsGu6Qja5BuyCRm/fpKtpsqssDJ1m+bJAk9iByQb/
+TUsttoJxwKBgFFbLPxYCDTVR2Ec6fv4HKWCy7pvAxCQvXzhnozlAozTuCTeQAAP
5I7cg8oF336l6usJ9s2qrSESSNhF++ULS7jrGw2FUs82F6X4kDAYXK16SEAKbx0q
u5CMX4QbMxZ3ay5Phm17D8EXd+Z5xdWztLeTThWHqXmfpyBmQLIUzrl5AoGARozo
0hnEGLbMsld04veg1qHZLIbyeQOSZcqiAkeV/DhLP079GhrEsZPn6qgQ5kVT+HtO
20X3ixdWFVwvSEWhKJsH/a+qlDKyN5BY44kxkdxq2IqxrmdBRS4lvYyGvQwf2k9I
NfYPM1Xqx6iAHv0JN+j5TBMfwsGl9zbSPXxiNDcCgYEAnfql+3Ou0LRiKU7QqYnu
oL32TAXLfzMSBqrWqKHw3IQ67nRTAotUF2yuShlRccz2bKalAXVCQbL8n9bkp5bv
8ZWjO0adhuHnU9YMS0KUVhYkJCxxTRlLyhS2k/Vbn2z0/bwK9HIpbdCOps2Eelp1
sBGKaxVj1R/p4XiHTOfKPG4=
-----END PRIVATE KEY-----
"""

"""Host name of container hosting ED REST API"""
EDWS_HOST = os.environ['EDWS_HOST'] if 'EDWS_HOST' in os.environ else 'ed-iam-ws'

"""Base URL of ED REST API"""
BASE_URL = f"https://{EDWS_HOST}:8443/v1"

# Suppress only the single warning from urllib3 needed.
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)


def createJwt():
  """Creates a JWT for use with ED REST API"""
  now = int(time.time())
  claims = {}
  claims['iss'] = f"uusid={SERVICE},ou=services,dc=vt,dc=edu"
  claims['iat'] = now
  claims['exp'] = now + VALIDITY_PERIOD * 60 * 60
  return jwt.encode(claims, PRIVATE_KEY, algorithm='RS256')


def fetchMembers(token, group):
  """Fetches members of the given ED group and returns a list of usernames"""
  headers = {
    'Authorization' : f"Bearer {token}"
  }
  url = f"{BASE_URL}/groups/{group}?with=members"
  response = requests.get(url, headers=headers, verify=False)
  if response.status_code != 200:
      raise Exception(f"{response.status_code} response from ED: {response.text}")
  data = response.json()
  return [member['pid'] for member in data['members']]

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/test-driver/pylib/grouper.py

```typescript
from urllib.parse import quote_plus
import os
import requests

API_VERSION = 'v4_13_000'

"""Host name of container hosting grouper web services"""
GROUPER_HOST = os.environ['GROUPER_HOST'] if 'GROUPER_HOST' in os.environ else 'grouper'

"""Headers sent with every GET request"""
GET_HEADERS = {
  'Authorization': 'Basic R3JvdXBlclN5c3RlbTpwYXNzd29yZA=='
}

"""Headers sent with every PUT/POST request"""
POST_HEADERS = {
  'Authorization': 'Basic R3JvdXBlclN5c3RlbTpwYXNzd29yZA==', #GrouperSystem/password
  'Content-Type': 'application/json',
}

"""Base URL of grouper web services"""
BASE_URL = f"http://{GROUPER_HOST}:8080/grouper/servicesRest/{API_VERSION}"

def createStem(name):
  body = {
    'WsRestStemSaveLiteRequest': {
      'stemName': name,
      'description': f"The {name} stem",
      'actAsSubjectId': 'GrouperSystem'
    }
  }
  encoded_stem = quote_plus(name)
  url = f"{BASE_URL}/stems/{encoded_stem}"
  response = requests.post(url, json=body, headers=POST_HEADERS)
  if response.status_code != 201:
      print(response.text)
      raise Exception(f"{response.status_code} response from StemSave endpoint: {response.text}")

def createGroup(name):
  body = {
    'WsRestGroupSaveLiteRequest': {
      'groupName': name,
      'description': f"The {name} group",
      'actAsSubjectId': 'GrouperSystem'
    }
  }
  encoded_name = quote_plus(name)
  url = f"{BASE_URL}/groups/{encoded_name}"
  response = requests.post(url, json=body, headers=POST_HEADERS)
  if response.status_code != 201:
      raise Exception(f"{response.status_code} response from GroupSave endpoint: {response.text}")

def addMembers(group, members):
  body = {
    'WsRestAddMemberRequest': {
      'subjectLookups': [],
      'replaceAllExisting': 'F',
      'actAsSubjectLookup': {
        'subjectId': 'GrouperSystem'
      }
    }
  }
  for member in members:
    body['WsRestAddMemberRequest']['subjectLookups'].append({'subjectIdentifier': member})
  encoded_group = quote_plus(group)
  url = f"{BASE_URL}/groups/{encoded_group}/members"
  response = requests.put(url, json=body, headers=POST_HEADERS)
  if response.status_code != 201:
      raise Exception(f"{response.status_code} response from AddMember endpoint: {response.text}")

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/test-driver/pylib/test.py

```typescript
import sys

def assertEquals(a, b):
  if (a == b):
    print(f"Assertion passed: {a} == {b}")
  else:
    print(f"Assertion failed: {a} != {b}")
    sys.exit(1)

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/test-driver/run-tests.sh

```typescript
#!/bin/sh

for SCRIPT in *.py; do
  echo
  echo
  echo "=========================================================================="
  echo "Running $SCRIPT"
  echo "--------------------------------------------------------------------------"
  python3 $SCRIPT
  RESULT=$?
  echo "--------------------------------------------------------------------------"
  if [ $RESULT -eq 0 ]; then
    echo "TEST PASSED"
  else
    echo "TEST FAILED"
  fi
  echo "=========================================================================="
  echo
  echo
  if [ $RESULT -ne 0 ]; then
    echo "Returning $RESULT process error code"
    exit $RESULT
  fi
done

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/vault/bin/run.sh

```typescript
#!/usr/bin/env sh

LOG_FILE="vault.log"
VAULT_ADDR="http://127.0.0.1:8200"
VAULT_ROOT="dit.middleware"
VAULT_PATH="$VAULT_ROOT/ed-iam/local"
vault server -dev -dev-listen-address="0.0.0.0:8200" -dev-root-token-id="00000000-0000-0000-0000-000000000000" > "$LOG_FILE" 2>&1 &
PID=$!
if [ $PID -gt 0 ]; then
  COUNT=0
  curl $VAULT_ADDR > /dev/null 2>&1
  echo -n "Waiting for vault to start..."
  while [[ $? && $COUNT -lt 10 ]]; do
    echo -n '.'
    COUNT=`expr $COUNT + 1`
    sleep 1
    curl $VAULT_ADDR > /dev/null 2>&1
  done
  echo "Vault running as process $PID."
else
  echo "Vault failed to start."
fi

echo "See $LOG_FILE for details."
cat $LOG_FILE
echo "Initializing vault with data required for ed-iam:"
vault secrets enable -version=2 -path=$VAULT_ROOT kv
echo -n '{
           "registry.datasource.password":"go2VajanyaTek",
           "ed.service.banner.banner-config.client-id":"ords",
           "ed.service.banner.banner-config.client-secret":"not-a-secret",
           "ed.service.ed.edldap-manager-certificate":"-----BEGIN CERTIFICATE-----\nMIIDETCCAfmgAwIBAgIJAITctXZPmI5OMA0GCSqGSIb3DQEBCwUAMA8xDTALBgNV\nBAMTBHRlc3QwHhcNMjIwMTEyMTUyNjIzWhcNMjQxMDA4MTUyNjIzWjAPMQ0wCwYD\nVQQDEwR0ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArpnELB7l\ncIny/idYJTAejo7mF3yt0iHZaKdTC40mkztKA1mE5Vs4n5mrRnmgCGi7MoTjJzNV\nUAsdVep08aBazGfOW4q3scJfQbWJyzxYGZc6imQ4Kk7POJl+ag5FArRhKxf8SQMy\na8b8375PyNiiau3gA0hLlgP7xmMV6MfH11fSCD9N/75w/+Bq4JO50Ua5HFi+5Fcm\nVX7oDPwv+QKGG4u+3UI8sdycGpn9gcZroYotZc4M0mfxWljxrKnKkbtKWjMNAxcF\ngRmFk2mbXsU0LRQ/5sn00vqsj8NyKaoVK3fO4kDRl9P2fYme7gZWtLu/9+t+46fo\nl/aFSgjkmpTo6wIDAQABo3AwbjAdBgNVHQ4EFgQUa90XnbqCg8FBZWCd6g9HIyyL\njOwwPwYDVR0jBDgwNoAUa90XnbqCg8FBZWCd6g9HIyyLjOyhE6QRMA8xDTALBgNV\nBAMTBHRlc3SCCQCE3LV2T5iOTjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUA\nA4IBAQAxGRMGneFin3r4tmjLx5EMtEC17C5wJnn24NNRV5o+yqlGIW+la/Yqj9WR\n0GVnnGQPoUI1ZAr1guPRposkJDsZbJQVUVk5D7SzXDJD3SXWuXrwB5uu+xIz3aPM\novy8V00kmgClBsXbQicw8J9rhl+pHLiCCkfbndIdWHjVumOLU835XSqzajMo9h04\nAZ5nCgc9Ljmdq46SCt0b/G6gX5h8QRR5bb21DXtVq6jwc0KuaNT23L8mjuaCZXR3\nRNxagFIS8LUqJlp8zbis0m2kdlCUWFVcl9MvLk8iUZTTXoBM2et9CcVBB0WFuyYg\nSe1I5jNCz/XBpqd+aqKxAC4a4Jri\n-----END CERTIFICATE-----\n",
           "ed.service.ed.edldap-manager-private-key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCumcQsHuVwifL+\nJ1glMB6OjuYXfK3SIdlop1MLjSaTO0oDWYTlWzifmatGeaAIaLsyhOMnM1VQCx1V\n6nTxoFrMZ85birexwl9BtYnLPFgZlzqKZDgqTs84mX5qDkUCtGErF/xJAzJrxvzf\nvk/I2KJq7eADSEuWA/vGYxXox8fXV9IIP03/vnD/4Grgk7nRRrkcWL7kVyZVfugM\n/C/5AoYbi77dQjyx3Jwamf2Bxmuhii1lzgzSZ/FaWPGsqcqRu0paMw0DFwWBGYWT\naZtexTQtFD/myfTS+qyPw3IpqhUrd87iQNGX0/Z9iZ7uBla0u7/3637jp+iX9oVK\nCOSalOjrAgMBAAECggEALg+AkgcgjhzGTsgAV+cm2ILYLnAExv+JBDPIE68L8yFb\n+CBAj+UNvgTjCzeAwVcnsz8dUbUYF4KnHYg5i5i6+1uTM9EXfryBNqt2i3gC4dVk\nayffLUIXJp5PnBjhmcIONDkio/xE6+vVwAzLrXeA+WaBhzwmPJAWdpKjMAKsNKGV\nUv2d4FE87CHFa72xB0JbJf1bsnbSy8jwvcJWUkSucsnEeNHNvdixavBrQEv24KC7\nDQkzFtJBFcnuS0KF+B8JEZ1+jYgQHM4BXqLJOG3dlZzpp25kYrxFQT/OKSGu5H3R\n/Sire4D/l0IHDACWd67cFL4DWuRUlR9d/uLlCHMqEQKBgQDnlmJODC4Zp3GWYBuL\nXcVtuczQZ7NDBYFeat6uD4rtv0VPkTXKUZVstgBSdhKpZKH/L/HPYqYJyONKgRoH\nuIxV4DyvCsHKPkOTfxhZf/E+y9VBf7FRosdKMY2g5t0YGixpE+JczOG3CldN4oIq\nSGAEdiJt7Wkkrc9FdHvy88iHiQKBgQDBAYmX5yOUWGDURas1y9aqi4o7wMKMslud\nOj4Fzf/80dcgO7ZZmBv1k6FKfihr2/xHTA1tZX20VcHRzAdiYqcJq6lWiVg2hlbt\nfpXvTYZLiQpKlIYUV59QOLuIx/acZ3nihtN7aLGsNFEB12LKlrdzfboUfMW5miqF\nHOSPC8Pb0wKBgF/uv9Is4XvnDPqJ3V8h/QKzENDT5EJDKY//HTdlYNuTfBa1xF6G\n5SsfSYrfNmPNN/4J0lViO/2Zpe3bBPllzVxVg03PWu94U23qHCAXC8xDi5eSWdXD\nZGKrnEum1reBQBxXDFH83ROBySCOT/VL/dpbRW/cBM4Y4d+XnTDLI6phAoGAGONc\n3dS1dtSqr9TIDijZ5qYVzjy+GayKOc0f4Fm/D9fzWLm6evUtbc56twNrrPTyJDN/\na8LxocaJNseLkDlOduXG8VzGnklWfkubg/9IOQdT52gdnhPqfErEjA/VEjgZtIdU\nUA6hEqawZ39hwuQKhf8JdsjcKmHh58ZhBr0qpXcCgYAgMvzIsJhk/uZ0NcSb/p+d\n468Pcp41nslSErg7dGpD3S9MmI6VsAvVdCiM4c+SKfaPKGBvCRhlIcxslzvVS0Av\nslWacHB2IhfxJHf4jCyLLMVCoepbeBGQfJlnFN3Svo/YjlTtAktoY1rC6hb6JOjq\nAOSKqPejySDToXZQNdQwGw==\n-----END PRIVATE KEY-----\n",
           "ed.service.ed.middleware-ed-service-certificate":"-----BEGIN CERTIFICATE-----\nMIIDETCCAfmgAwIBAgIJAITctXZPmI5OMA0GCSqGSIb3DQEBCwUAMA8xDTALBgNV\nBAMTBHRlc3QwHhcNMjIwMTEyMTUyNjIzWhcNMjQxMDA4MTUyNjIzWjAPMQ0wCwYD\nVQQDEwR0ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArpnELB7l\ncIny/idYJTAejo7mF3yt0iHZaKdTC40mkztKA1mE5Vs4n5mrRnmgCGi7MoTjJzNV\nUAsdVep08aBazGfOW4q3scJfQbWJyzxYGZc6imQ4Kk7POJl+ag5FArRhKxf8SQMy\na8b8375PyNiiau3gA0hLlgP7xmMV6MfH11fSCD9N/75w/+Bq4JO50Ua5HFi+5Fcm\nVX7oDPwv+QKGG4u+3UI8sdycGpn9gcZroYotZc4M0mfxWljxrKnKkbtKWjMNAxcF\ngRmFk2mbXsU0LRQ/5sn00vqsj8NyKaoVK3fO4kDRl9P2fYme7gZWtLu/9+t+46fo\nl/aFSgjkmpTo6wIDAQABo3AwbjAdBgNVHQ4EFgQUa90XnbqCg8FBZWCd6g9HIyyL\njOwwPwYDVR0jBDgwNoAUa90XnbqCg8FBZWCd6g9HIyyLjOyhE6QRMA8xDTALBgNV\nBAMTBHRlc3SCCQCE3LV2T5iOTjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUA\nA4IBAQAxGRMGneFin3r4tmjLx5EMtEC17C5wJnn24NNRV5o+yqlGIW+la/Yqj9WR\n0GVnnGQPoUI1ZAr1guPRposkJDsZbJQVUVk5D7SzXDJD3SXWuXrwB5uu+xIz3aPM\novy8V00kmgClBsXbQicw8J9rhl+pHLiCCkfbndIdWHjVumOLU835XSqzajMo9h04\nAZ5nCgc9Ljmdq46SCt0b/G6gX5h8QRR5bb21DXtVq6jwc0KuaNT23L8mjuaCZXR3\nRNxagFIS8LUqJlp8zbis0m2kdlCUWFVcl9MvLk8iUZTTXoBM2et9CcVBB0WFuyYg\nSe1I5jNCz/XBpqd+aqKxAC4a4Jri\n-----END CERTIFICATE-----\n",
           "ed.service.ed.middleware-ed-service-private-key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCumcQsHuVwifL+\nJ1glMB6OjuYXfK3SIdlop1MLjSaTO0oDWYTlWzifmatGeaAIaLsyhOMnM1VQCx1V\n6nTxoFrMZ85birexwl9BtYnLPFgZlzqKZDgqTs84mX5qDkUCtGErF/xJAzJrxvzf\nvk/I2KJq7eADSEuWA/vGYxXox8fXV9IIP03/vnD/4Grgk7nRRrkcWL7kVyZVfugM\n/C/5AoYbi77dQjyx3Jwamf2Bxmuhii1lzgzSZ/FaWPGsqcqRu0paMw0DFwWBGYWT\naZtexTQtFD/myfTS+qyPw3IpqhUrd87iQNGX0/Z9iZ7uBla0u7/3637jp+iX9oVK\nCOSalOjrAgMBAAECggEALg+AkgcgjhzGTsgAV+cm2ILYLnAExv+JBDPIE68L8yFb\n+CBAj+UNvgTjCzeAwVcnsz8dUbUYF4KnHYg5i5i6+1uTM9EXfryBNqt2i3gC4dVk\nayffLUIXJp5PnBjhmcIONDkio/xE6+vVwAzLrXeA+WaBhzwmPJAWdpKjMAKsNKGV\nUv2d4FE87CHFa72xB0JbJf1bsnbSy8jwvcJWUkSucsnEeNHNvdixavBrQEv24KC7\nDQkzFtJBFcnuS0KF+B8JEZ1+jYgQHM4BXqLJOG3dlZzpp25kYrxFQT/OKSGu5H3R\n/Sire4D/l0IHDACWd67cFL4DWuRUlR9d/uLlCHMqEQKBgQDnlmJODC4Zp3GWYBuL\nXcVtuczQZ7NDBYFeat6uD4rtv0VPkTXKUZVstgBSdhKpZKH/L/HPYqYJyONKgRoH\nuIxV4DyvCsHKPkOTfxhZf/E+y9VBf7FRosdKMY2g5t0YGixpE+JczOG3CldN4oIq\nSGAEdiJt7Wkkrc9FdHvy88iHiQKBgQDBAYmX5yOUWGDURas1y9aqi4o7wMKMslud\nOj4Fzf/80dcgO7ZZmBv1k6FKfihr2/xHTA1tZX20VcHRzAdiYqcJq6lWiVg2hlbt\nfpXvTYZLiQpKlIYUV59QOLuIx/acZ3nihtN7aLGsNFEB12LKlrdzfboUfMW5miqF\nHOSPC8Pb0wKBgF/uv9Is4XvnDPqJ3V8h/QKzENDT5EJDKY//HTdlYNuTfBa1xF6G\n5SsfSYrfNmPNN/4J0lViO/2Zpe3bBPllzVxVg03PWu94U23qHCAXC8xDi5eSWdXD\nZGKrnEum1reBQBxXDFH83ROBySCOT/VL/dpbRW/cBM4Y4d+XnTDLI6phAoGAGONc\n3dS1dtSqr9TIDijZ5qYVzjy+GayKOc0f4Fm/D9fzWLm6evUtbc56twNrrPTyJDN/\na8LxocaJNseLkDlOduXG8VzGnklWfkubg/9IOQdT52gdnhPqfErEjA/VEjgZtIdU\nUA6hEqawZ39hwuQKhf8JdsjcKmHh58ZhBr0qpXcCgYAgMvzIsJhk/uZ0NcSb/p+d\n468Pcp41nslSErg7dGpD3S9MmI6VsAvVdCiM4c+SKfaPKGBvCRhlIcxslzvVS0Av\nslWacHB2IhfxJHf4jCyLLMVCoepbeBGQfJlnFN3Svo/YjlTtAktoY1rC6hb6JOjq\nAOSKqPejySDToXZQNdQwGw==\n-----END PRIVATE KEY-----\n",
           "ed.service.google.forward-accounts-signing-key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCumcQsHuVwifL+\nJ1glMB6OjuYXfK3SIdlop1MLjSaTO0oDWYTlWzifmatGeaAIaLsyhOMnM1VQCx1V\n6nTxoFrMZ85birexwl9BtYnLPFgZlzqKZDgqTs84mX5qDkUCtGErF/xJAzJrxvzf\nvk/I2KJq7eADSEuWA/vGYxXox8fXV9IIP03/vnD/4Grgk7nRRrkcWL7kVyZVfugM\n/C/5AoYbi77dQjyx3Jwamf2Bxmuhii1lzgzSZ/FaWPGsqcqRu0paMw0DFwWBGYWT\naZtexTQtFD/myfTS+qyPw3IpqhUrd87iQNGX0/Z9iZ7uBla0u7/3637jp+iX9oVK\nCOSalOjrAgMBAAECggEALg+AkgcgjhzGTsgAV+cm2ILYLnAExv+JBDPIE68L8yFb\n+CBAj+UNvgTjCzeAwVcnsz8dUbUYF4KnHYg5i5i6+1uTM9EXfryBNqt2i3gC4dVk\nayffLUIXJp5PnBjhmcIONDkio/xE6+vVwAzLrXeA+WaBhzwmPJAWdpKjMAKsNKGV\nUv2d4FE87CHFa72xB0JbJf1bsnbSy8jwvcJWUkSucsnEeNHNvdixavBrQEv24KC7\nDQkzFtJBFcnuS0KF+B8JEZ1+jYgQHM4BXqLJOG3dlZzpp25kYrxFQT/OKSGu5H3R\n/Sire4D/l0IHDACWd67cFL4DWuRUlR9d/uLlCHMqEQKBgQDnlmJODC4Zp3GWYBuL\nXcVtuczQZ7NDBYFeat6uD4rtv0VPkTXKUZVstgBSdhKpZKH/L/HPYqYJyONKgRoH\nuIxV4DyvCsHKPkOTfxhZf/E+y9VBf7FRosdKMY2g5t0YGixpE+JczOG3CldN4oIq\nSGAEdiJt7Wkkrc9FdHvy88iHiQKBgQDBAYmX5yOUWGDURas1y9aqi4o7wMKMslud\nOj4Fzf/80dcgO7ZZmBv1k6FKfihr2/xHTA1tZX20VcHRzAdiYqcJq6lWiVg2hlbt\nfpXvTYZLiQpKlIYUV59QOLuIx/acZ3nihtN7aLGsNFEB12LKlrdzfboUfMW5miqF\nHOSPC8Pb0wKBgF/uv9Is4XvnDPqJ3V8h/QKzENDT5EJDKY//HTdlYNuTfBa1xF6G\n5SsfSYrfNmPNN/4J0lViO/2Zpe3bBPllzVxVg03PWu94U23qHCAXC8xDi5eSWdXD\nZGKrnEum1reBQBxXDFH83ROBySCOT/VL/dpbRW/cBM4Y4d+XnTDLI6phAoGAGONc\n3dS1dtSqr9TIDijZ5qYVzjy+GayKOc0f4Fm/D9fzWLm6evUtbc56twNrrPTyJDN/\na8LxocaJNseLkDlOduXG8VzGnklWfkubg/9IOQdT52gdnhPqfErEjA/VEjgZtIdU\nUA6hEqawZ39hwuQKhf8JdsjcKmHh58ZhBr0qpXcCgYAgMvzIsJhk/uZ0NcSb/p+d\n468Pcp41nslSErg7dGpD3S9MmI6VsAvVdCiM4c+SKfaPKGBvCRhlIcxslzvVS0Av\nslWacHB2IhfxJHf4jCyLLMVCoepbeBGQfJlnFN3Svo/YjlTtAktoY1rC6hb6JOjq\nAOSKqPejySDToXZQNdQwGw==\n-----END PRIVATE KEY-----\n",
           "ed.service.google.vt-accounts-signing-key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCumcQsHuVwifL+\nJ1glMB6OjuYXfK3SIdlop1MLjSaTO0oDWYTlWzifmatGeaAIaLsyhOMnM1VQCx1V\n6nTxoFrMZ85birexwl9BtYnLPFgZlzqKZDgqTs84mX5qDkUCtGErF/xJAzJrxvzf\nvk/I2KJq7eADSEuWA/vGYxXox8fXV9IIP03/vnD/4Grgk7nRRrkcWL7kVyZVfugM\n/C/5AoYbi77dQjyx3Jwamf2Bxmuhii1lzgzSZ/FaWPGsqcqRu0paMw0DFwWBGYWT\naZtexTQtFD/myfTS+qyPw3IpqhUrd87iQNGX0/Z9iZ7uBla0u7/3637jp+iX9oVK\nCOSalOjrAgMBAAECggEALg+AkgcgjhzGTsgAV+cm2ILYLnAExv+JBDPIE68L8yFb\n+CBAj+UNvgTjCzeAwVcnsz8dUbUYF4KnHYg5i5i6+1uTM9EXfryBNqt2i3gC4dVk\nayffLUIXJp5PnBjhmcIONDkio/xE6+vVwAzLrXeA+WaBhzwmPJAWdpKjMAKsNKGV\nUv2d4FE87CHFa72xB0JbJf1bsnbSy8jwvcJWUkSucsnEeNHNvdixavBrQEv24KC7\nDQkzFtJBFcnuS0KF+B8JEZ1+jYgQHM4BXqLJOG3dlZzpp25kYrxFQT/OKSGu5H3R\n/Sire4D/l0IHDACWd67cFL4DWuRUlR9d/uLlCHMqEQKBgQDnlmJODC4Zp3GWYBuL\nXcVtuczQZ7NDBYFeat6uD4rtv0VPkTXKUZVstgBSdhKpZKH/L/HPYqYJyONKgRoH\nuIxV4DyvCsHKPkOTfxhZf/E+y9VBf7FRosdKMY2g5t0YGixpE+JczOG3CldN4oIq\nSGAEdiJt7Wkkrc9FdHvy88iHiQKBgQDBAYmX5yOUWGDURas1y9aqi4o7wMKMslud\nOj4Fzf/80dcgO7ZZmBv1k6FKfihr2/xHTA1tZX20VcHRzAdiYqcJq6lWiVg2hlbt\nfpXvTYZLiQpKlIYUV59QOLuIx/acZ3nihtN7aLGsNFEB12LKlrdzfboUfMW5miqF\nHOSPC8Pb0wKBgF/uv9Is4XvnDPqJ3V8h/QKzENDT5EJDKY//HTdlYNuTfBa1xF6G\n5SsfSYrfNmPNN/4J0lViO/2Zpe3bBPllzVxVg03PWu94U23qHCAXC8xDi5eSWdXD\nZGKrnEum1reBQBxXDFH83ROBySCOT/VL/dpbRW/cBM4Y4d+XnTDLI6phAoGAGONc\n3dS1dtSqr9TIDijZ5qYVzjy+GayKOc0f4Fm/D9fzWLm6evUtbc56twNrrPTyJDN/\na8LxocaJNseLkDlOduXG8VzGnklWfkubg/9IOQdT52gdnhPqfErEjA/VEjgZtIdU\nUA6hEqawZ39hwuQKhf8JdsjcKmHh58ZhBr0qpXcCgYAgMvzIsJhk/uZ0NcSb/p+d\n468Pcp41nslSErg7dGpD3S9MmI6VsAvVdCiM4c+SKfaPKGBvCRhlIcxslzvVS0Av\nslWacHB2IhfxJHf4jCyLLMVCoepbeBGQfJlnFN3Svo/YjlTtAktoY1rC6hb6JOjq\nAOSKqPejySDToXZQNdQwGw==\n-----END PRIVATE KEY-----\n",
           "ed.service.secret-encryption-keys":[
             {
               "name":"key-1",
               "base64Key":"GwpzuRSKObp/iU5/2fEceA=="
             }
           ],
           "ed.ws.tokens-ed-service-certificate":"-----BEGIN CERTIFICATE-----\nMIIDETCCAfmgAwIBAgIJAITctXZPmI5OMA0GCSqGSIb3DQEBCwUAMA8xDTALBgNV\nBAMTBHRlc3QwHhcNMjIwMTEyMTUyNjIzWhcNMjQxMDA4MTUyNjIzWjAPMQ0wCwYD\nVQQDEwR0ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArpnELB7l\ncIny/idYJTAejo7mF3yt0iHZaKdTC40mkztKA1mE5Vs4n5mrRnmgCGi7MoTjJzNV\nUAsdVep08aBazGfOW4q3scJfQbWJyzxYGZc6imQ4Kk7POJl+ag5FArRhKxf8SQMy\na8b8375PyNiiau3gA0hLlgP7xmMV6MfH11fSCD9N/75w/+Bq4JO50Ua5HFi+5Fcm\nVX7oDPwv+QKGG4u+3UI8sdycGpn9gcZroYotZc4M0mfxWljxrKnKkbtKWjMNAxcF\ngRmFk2mbXsU0LRQ/5sn00vqsj8NyKaoVK3fO4kDRl9P2fYme7gZWtLu/9+t+46fo\nl/aFSgjkmpTo6wIDAQABo3AwbjAdBgNVHQ4EFgQUa90XnbqCg8FBZWCd6g9HIyyL\njOwwPwYDVR0jBDgwNoAUa90XnbqCg8FBZWCd6g9HIyyLjOyhE6QRMA8xDTALBgNV\nBAMTBHRlc3SCCQCE3LV2T5iOTjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUA\nA4IBAQAxGRMGneFin3r4tmjLx5EMtEC17C5wJnn24NNRV5o+yqlGIW+la/Yqj9WR\n0GVnnGQPoUI1ZAr1guPRposkJDsZbJQVUVk5D7SzXDJD3SXWuXrwB5uu+xIz3aPM\novy8V00kmgClBsXbQicw8J9rhl+pHLiCCkfbndIdWHjVumOLU835XSqzajMo9h04\nAZ5nCgc9Ljmdq46SCt0b/G6gX5h8QRR5bb21DXtVq6jwc0KuaNT23L8mjuaCZXR3\nRNxagFIS8LUqJlp8zbis0m2kdlCUWFVcl9MvLk8iUZTTXoBM2et9CcVBB0WFuyYg\nSe1I5jNCz/XBpqd+aqKxAC4a4Jri\n-----END CERTIFICATE-----\n",
           "ed.ws.tokens-ed-service-private-key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCumcQsHuVwifL+\nJ1glMB6OjuYXfK3SIdlop1MLjSaTO0oDWYTlWzifmatGeaAIaLsyhOMnM1VQCx1V\n6nTxoFrMZ85birexwl9BtYnLPFgZlzqKZDgqTs84mX5qDkUCtGErF/xJAzJrxvzf\nvk/I2KJq7eADSEuWA/vGYxXox8fXV9IIP03/vnD/4Grgk7nRRrkcWL7kVyZVfugM\n/C/5AoYbi77dQjyx3Jwamf2Bxmuhii1lzgzSZ/FaWPGsqcqRu0paMw0DFwWBGYWT\naZtexTQtFD/myfTS+qyPw3IpqhUrd87iQNGX0/Z9iZ7uBla0u7/3637jp+iX9oVK\nCOSalOjrAgMBAAECggEALg+AkgcgjhzGTsgAV+cm2ILYLnAExv+JBDPIE68L8yFb\n+CBAj+UNvgTjCzeAwVcnsz8dUbUYF4KnHYg5i5i6+1uTM9EXfryBNqt2i3gC4dVk\nayffLUIXJp5PnBjhmcIONDkio/xE6+vVwAzLrXeA+WaBhzwmPJAWdpKjMAKsNKGV\nUv2d4FE87CHFa72xB0JbJf1bsnbSy8jwvcJWUkSucsnEeNHNvdixavBrQEv24KC7\nDQkzFtJBFcnuS0KF+B8JEZ1+jYgQHM4BXqLJOG3dlZzpp25kYrxFQT/OKSGu5H3R\n/Sire4D/l0IHDACWd67cFL4DWuRUlR9d/uLlCHMqEQKBgQDnlmJODC4Zp3GWYBuL\nXcVtuczQZ7NDBYFeat6uD4rtv0VPkTXKUZVstgBSdhKpZKH/L/HPYqYJyONKgRoH\nuIxV4DyvCsHKPkOTfxhZf/E+y9VBf7FRosdKMY2g5t0YGixpE+JczOG3CldN4oIq\nSGAEdiJt7Wkkrc9FdHvy88iHiQKBgQDBAYmX5yOUWGDURas1y9aqi4o7wMKMslud\nOj4Fzf/80dcgO7ZZmBv1k6FKfihr2/xHTA1tZX20VcHRzAdiYqcJq6lWiVg2hlbt\nfpXvTYZLiQpKlIYUV59QOLuIx/acZ3nihtN7aLGsNFEB12LKlrdzfboUfMW5miqF\nHOSPC8Pb0wKBgF/uv9Is4XvnDPqJ3V8h/QKzENDT5EJDKY//HTdlYNuTfBa1xF6G\n5SsfSYrfNmPNN/4J0lViO/2Zpe3bBPllzVxVg03PWu94U23qHCAXC8xDi5eSWdXD\nZGKrnEum1reBQBxXDFH83ROBySCOT/VL/dpbRW/cBM4Y4d+XnTDLI6phAoGAGONc\n3dS1dtSqr9TIDijZ5qYVzjy+GayKOc0f4Fm/D9fzWLm6evUtbc56twNrrPTyJDN/\na8LxocaJNseLkDlOduXG8VzGnklWfkubg/9IOQdT52gdnhPqfErEjA/VEjgZtIdU\nUA6hEqawZ39hwuQKhf8JdsjcKmHh58ZhBr0qpXcCgYAgMvzIsJhk/uZ0NcSb/p+d\n468Pcp41nslSErg7dGpD3S9MmI6VsAvVdCiM4c+SKfaPKGBvCRhlIcxslzvVS0Av\nslWacHB2IhfxJHf4jCyLLMVCoepbeBGQfJlnFN3Svo/YjlTtAktoY1rC6hb6JOjq\nAOSKqPejySDToXZQNdQwGw==\n-----END PRIVATE KEY-----\n"
         }' | vault kv put $VAULT_PATH -

echo "Vault startup and initialization completed"
tail -f /dev/null

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/vault/etc/create-midPoint-jwt.py

```typescript
#!/usr/bin/env python3

import time

from jwt import (
    JWT,
    jwk_from_dict,
    jwk_from_pem,
)

# Read ED service private key used to sign authentication tokens
with open('../credentials/midPoint.key', 'rb') as f:
  key = jwk_from_pem(f.read())

# Create authentication token that is valid for 1 hour
# It may be reused several times in that period
now = time.time()
claims = {
  'iss': 'uusid=midpoint,ou=services,dc=vt,dc=edu',
  'iat': int(now),
  'exp': int(now) + 60 * 60 * 1
}
instance = JWT()
token = instance.encode(claims, key, alg='RS256')
print(token)

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/vault/etc/create-midPoint-jwt.sh

```typescript
#!/bin/bash

# Read the private key from the file
private_key=$(cat ../credentials/midPoint.key)

# Set the claims
issuer="uusid=midpoint,ou=services,dc=vt,dc=edu"
issued_at=$(date +%s)
expiration=$(($(date +%s) + 3600))

# Create header and payload JSON strings
header='{"alg":"RS256","typ":"JWT"}'
payload=$(printf '{"iss":"%s","iat":%d,"exp":%d}' "$issuer" "$issued_at" "$expiration")

# Base64Url encode header and payload
b64url_header=$(echo -n "$header" | openssl base64 -A | tr '+/' '-_' | tr -d '=')
b64url_payload=$(echo -n "$payload" | openssl base64 -A | tr '+/' '-_' | tr -d '=')

# Create the signature
signature=$(printf '%s.%s' "$b64url_header" "$b64url_payload" | openssl dgst -binary -sha256 -sign <(echo -n "$private_key") | openssl base64 -A | tr '+/' '-_' | tr -d '=')

# Combine encoded header, payload, and signature to create the JWT token
jwt_token="${b64url_header}.${b64url_payload}.${signature}"

# Print the token
echo "$jwt_token"

```

## /Users/ddonahoe/code/midpoint/local-env/src/test/docker/vault/etc/gen-registry-cert-encoded-value.sh

```typescript
#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
openssl x509 -in "$SCRIPT_DIR/../../midpoint/certs/midpoint.pem" \
  -outform der | gzip | openssl enc -A -base64

```

## /Users/ddonahoe/code/midpoint/pom.xml

```typescript
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <packaging>pom</packaging>

  <groupId>edu.vt</groupId>
  <artifactId>midpoint</artifactId>
  <version>4.8.5.2-SNAPSHOT</version>

  <name>midPoint Parent</name>

  <properties>
    <maven.build.timestamp.format>yyyyMMdd.HHmmss</maven.build.timestamp.format>
    <docker.dev.version>${project.version}-${maven.build.timestamp}</docker.dev.version>
    <docker.pprd.version>${project.version}-${maven.build.timestamp}-pprd</docker.pprd.version>
    <docker.prod.version>v${project.version}</docker.prod.version>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <!-- Dependency versions -->
    <java-core-lib.version>1.2.1</java-core-lib.version>
    <mw-spring-boot-core.version>3.3.5.0</mw-spring-boot-core.version>
    <ldaptive-connector.version>1.0.0-SNAPSHOT</ldaptive-connector.version>
    <grouper-connector.version>1.2.0.1</grouper-connector.version>
    <scripted-sql-connector.version>2.3</scripted-sql-connector.version>
  </properties>

  <modules>
    <module>docker</module>
    <module>aws</module>
  </modules>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>edu.vt.midpoint</groupId>
        <artifactId>ldaptive-connector</artifactId>
        <version>${ldaptive-connector.version}</version>
      </dependency>
      <dependency>
        <groupId>com.evolveum.polygon</groupId>
        <artifactId>connector-grouper</artifactId>
        <version>${grouper-connector.version}</version>
      </dependency>
      <dependency>
        <groupId>com.evolveum.polygon</groupId>
        <artifactId>connector-scripted-sql</artifactId>
        <version>${scripted-sql-connector.version}</version>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-enforcer-plugin</artifactId>
          <version>3.3.0</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-resources-plugin</artifactId>
          <version>3.3.1</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-dependency-plugin</artifactId>
          <version>3.6.0</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-checkstyle-plugin</artifactId>
          <version>3.3.0</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.11.0</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>3.1.2</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-jar-plugin</artifactId>
          <version>3.3.0</version>
        </plugin>
      </plugins>
    </pluginManagement>

    <plugins>
      <plugin>
        <groupId>org.owasp</groupId>
        <artifactId>dependency-check-maven</artifactId>
        <configuration>
          <!-- No dependency analysis needed for this project-->
          <skip>true</skip>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-enforcer-plugin</artifactId>
        <executions>
          <execution>
            <id>enforce-maven</id>
            <goals>
              <goal>enforce</goal>
            </goals>
            <configuration>
              <rules>
                <requireMavenVersion>
                  <version>[3.9.0,)</version>
                </requireMavenVersion>
              </rules>
            </configuration>
          </execution>
        </executions>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-checkstyle-plugin</artifactId>
        <dependencies>
          <dependency>
            <groupId>com.puppycrawl.tools</groupId>
            <artifactId>checkstyle</artifactId>
            <version>10.12.2</version>
          </dependency>
          <dependency>
            <groupId>edu.vt.middleware</groupId>
            <artifactId>java-core-lib</artifactId>
            <version>${java-core-lib.version}</version>
          </dependency>
        </dependencies>
        <executions>
          <execution>
            <id>checkstyle</id>
            <phase>validate</phase>
            <goals>
              <goal>check</goal>
            </goals>
            <configuration>
              <sourceDirectories>${project.build.sourceDirectory}</sourceDirectories>
              <configLocation>checkstyle/checks.xml</configLocation>
              <headerLocation>checkstyle/header.txt</headerLocation>
              <includeTestSourceDirectory>false</includeTestSourceDirectory>
              <failsOnError>true</failsOnError>
              <outputFileFormat>plain</outputFileFormat>
            </configuration>
          </execution>
        </executions>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.11.0</version>
        <configuration>
          <source>${maven.compiler.source}</source>
          <target>${maven.compiler.target}</target>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <configuration>
          <redirectTestOutputToFile>true</redirectTestOutputToFile>
        </configuration>
      </plugin>
    </plugins>
  </build>

  <repositories>
    <repository>
      <id>evolveum-nexus-releases</id>
      <name>Internal Releases</name>
      <url>https://nexus.evolveum.com/nexus/content/repositories/releases/</url>
    </repository>
    <repository>
      <!--
      This repository is useful as a staging area for snapshots.
      See MIDPOINT-34 as an example.
      -->
      <id>middleware</id>
      <name>Middleware Repository</name>
      <url>https://code.vt.edu/middleware/maven-repo/raw/master</url>
    </repository>
  </repositories>

  <profiles>
    <profile>
      <id>default</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <repositories>
        <repository>
          <id>gitlab-maven</id>
          <url>https://code.vt.edu/api/v4/groups/7/-/packages/maven</url>
        </repository>
      </repositories>
      <pluginRepositories>
        <pluginRepository>
          <id>gitlab-maven</id>
          <url>https://code.vt.edu/api/v4/groups/7/-/packages/maven</url>
        </pluginRepository>
      </pluginRepositories>
    </profile>
    <profile>
      <id>pipeline</id>
      <repositories>
        <repository>
          <id>gitlab-maven-pipeline</id>
          <url>https://code.vt.edu/api/v4/groups/7/-/packages/maven</url>
        </repository>
      </repositories>
      <pluginRepositories>
        <pluginRepository>
          <id>gitlab-maven-pipeline</id>
          <url>https://code.vt.edu/api/v4/groups/7/-/packages/maven</url>
        </pluginRepository>
      </pluginRepositories>
    </profile>
  </profiles>

</project>

```

