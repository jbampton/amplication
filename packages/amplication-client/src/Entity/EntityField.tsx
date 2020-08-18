import React, { useCallback, useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import { gql } from "apollo-boost";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { DrawerContent } from "@rmwc/drawer";
import "@rmwc/drawer/styles";
import { Snackbar } from "@rmwc/snackbar";
import "@rmwc/snackbar/styles";
import { formatError } from "../util/error";
import EntityFieldForm from "./EntityFieldForm";
import * as models from "../models";
import SidebarHeader from "../Layout/SidebarHeader";

type TData = {
  entity: models.Entity;
  entityField: models.EntityField;
};

const EntityField = () => {
  const match = useRouteMatch<{
    application: string;
    entity: string;
    field: string;
  }>("/:application/entities/:entity/fields/:field");

  const { application, entity, field } = match?.params ?? {};

  const { data, error, loading } = useQuery<TData>(GET_ENTITY_FIELD, {
    variables: {
      entity,
      field,
    },
  });

  const [updateEntityField, { error: updateError }] = useMutation(
    UPDATE_ENTITY_FIELD
  );

  const handleSubmit = useCallback(
    (data) => {
      updateEntityField({
        variables: {
          where: {
            id: field,
          },
          data,
        },
      }).catch(console.error);
    },
    [updateEntityField, field]
  );

  const hasError = Boolean(error) || Boolean(updateError);
  const errorMessage = formatError(error) || formatError(updateError);

  const defaultValues = useMemo(
    () =>
      data?.entityField && {
        ...data.entityField,
        properties: data.entityField.properties,
      },
    [data]
  );

  return (
    <>
      <SidebarHeader showBack backUrl={`/${application}/entities/${entity}`}>
        {loading
          ? "Loading..."
          : `${data?.entity.name} | ${data?.entityField.name}`}
      </SidebarHeader>
      {!loading && (
        <DrawerContent>
          <EntityFieldForm
            submitButtonTitle="Update"
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
          />
        </DrawerContent>
      )}
      <Snackbar open={hasError} message={errorMessage} />
    </>
  );
};

export default EntityField;

const GET_ENTITY_FIELD = gql`
  query getEntityField($entity: String!, $field: String!) {
    entity(where: { id: $entity }) {
      id
      name
    }
    entityField(where: { id: $field }) {
      id
      createdAt
      updatedAt
      name
      displayName
      dataType
      properties
      required
      searchable
      description
    }
  }
`;

const UPDATE_ENTITY_FIELD = gql`
  mutation updateEntityField(
    $data: EntityFieldUpdateInput!
    $where: WhereUniqueInput!
  ) {
    updateEntityField(data: $data, where: $where) {
      id
      createdAt
      updatedAt
      name
      displayName
      dataType
      properties
      required
      searchable
      description
    }
  }
`;
