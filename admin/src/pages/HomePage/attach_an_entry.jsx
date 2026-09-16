import React, { useEffect, useState } from "react";

import { Grid } from "@strapi/design-system";
import Selector from "./selector";

import MakeItTitle from "./make_it_title";
import { useFetchClient } from "@strapi/strapi/admin";
import { getContentTypeName } from "./functions";

// Content types don't have a generic "title" field: resolve the option
// label from whichever field actually holds a human-readable name.
const CONTENT_TYPE_LABEL_FIELDS = {
  beneficio: "titulo",
  empleado: "name",
};

const buildOptionsFromContentTypes = (contentTypes) => {
  const options = [];
  if (!contentTypes || contentTypes.length === 0) return options;
  contentTypes.forEach((contentType) => {
    options.push({
      label: contentType.globalId,
      value: contentType.uid,
    });
  });
  return options;
};

function getEntryLabel(item, labelField) {
  return item[labelField] || item.title || "No title";
}

function buildOptionsFromEntries(responseData, labelField) {
  let options = [];
  if (!responseData) {
    return options;
  } else if (Array.isArray(responseData)) {
    options = responseData.map((item) => {
      return { value: item.documentId, label: getEntryLabel(item, labelField) };
    });
  } else if (typeof responseData === "object") {
    options.push({
      value: responseData.documentId,
      label: getEntryLabel(responseData, labelField),
    });
  } else {
    console.error("Response data is neither an array nor an object");
  }
  return options;
}

export default function AttachAnEntry(props) {
  const { formik } = props;
  const [contentTypes, setContentTypes] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { get } = useFetchClient();
  async function fetchTypes() {
    setLoading(true);
    const res = await get(`/expo-notifications/get-content-types`);
    const typesOptions = buildOptionsFromContentTypes(res.data);
    setContentTypes(typesOptions);
    if (typesOptions.length > 0) {
      formik.setFieldValue("contentType", typesOptions[0].value);
      fetchEntries(typesOptions[0].value);
    }
  }
  async function fetchEntries(value) {
    const res = await get(`/expo-notifications/get-entries/${value}`);
    const labelField = CONTENT_TYPE_LABEL_FIELDS[getContentTypeName(value)] || "title";
    const entriesOptions = buildOptionsFromEntries(res.data, labelField);
    setEntries(entriesOptions);
    if (entriesOptions.length > 0) {
      formik.setFieldValue("entryId", entriesOptions[0].value);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchTypes();
  }, []);
  const manageContentTypeSelected = (value) => {
    formik.setFieldValue("contentType", value);
    fetchEntries(value);
  };
  const manageEntrySelected = (value) => {
    formik.setFieldValue("entryId", value);
  };
  function getLabelFromValue(value) {
    const found = entries.find((item) => item.value == value);
    return found ? found.label : "";
  }
  return (
    <div>
      <Grid.Root gap={5}>
        <Grid.Item col={3}>
          <Selector
            type="Content type"
            options={contentTypes}
            manageSelected={manageContentTypeSelected}
            value={formik.values.contentType}
            placeholder="Select a content type"
            loading={loading}
          />
        </Grid.Item>
        <Grid.Item col={9}>
          <Selector
            type="Entry"
            options={entries}
            manageSelected={manageEntrySelected}
            value={formik.values.entryId}
            placeholder="Select an entry"
          />
          <MakeItTitle
            formik={formik}
            label={getLabelFromValue(formik.values.entryId)}
          />
        </Grid.Item>
      </Grid.Root>
    </div>
  );
}
