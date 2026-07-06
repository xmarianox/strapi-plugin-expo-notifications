import React, { useState } from "react";

import { Routes, Route } from "react-router-dom";
import Empty from "./empty";
import { Layouts } from "@strapi/strapi/admin";

import { useFormik } from "formik";
import * as Yup from "yup";

import { useIntl } from "react-intl";

import Sender from "./sender";

import Sent from "./sent";
import Receivers from "./receivers";
import pluginId from "../../pluginId";

import getTrad from "../../utils/getTrad";
import { getContentTypeName } from "./functions";
import { useFetchClient } from "@strapi/strapi/admin";


export default function Main({
  notifications,
  count,
  receivers,
  receiversCount,
  refreshNotificationsState,
  isLoading,
  testToken,
}) {
  const [tokens, setTokens] = useState([]);
  const [testMode, setTestMode] = useState(false);
  const { post } = useFetchClient();
  const { formatMessage } = useIntl();
  const addToken = (token) => {
    setTokens([...tokens, token]);
  };
  const removeToken = (token) => {
    setTokens(tokens.filter((item) => item !== token));
  };
  const addAll = () => {
    const allTokens = receivers.map((item) => item.value);
    setTokens(allTokens);
  };
  const removeAll = () => {
    setTokens([]);
  };
  const formik = useFormik({
    initialValues: {
      title: "",
      subtitle: "",
      contentType: "",
      entryId: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required(
        formatMessage({
          id: getTrad("form.required"),
          defaultMessage: "Required field",
        })
      ),
    }),
    onSubmit: async (values) => {
      values.contentType = getContentTypeName(values.contentType);
      console.log("modified values from send test", values);
      if (testMode) {
        const testTokens = [testToken];
        values.title = `[Test] ${values.title}`;
        await post(`/expo-notifications/process-notification`, {
          data: values,
          tokens: testTokens,
        }).then((res) => {
          refreshNotificationsState();
          resetForm();
        });
        return;
      }
      if (tokens.length !== 0) {
        await post(`/expo-notifications/process-notification`, {
          data: values,
          tokens: tokens,
        }).then((res) => {
          refreshNotificationsState();
          resetForm();
        });
      } else {
        console.log("no receivers");
      }
    },
  });
  const resetForm = () => {
    formik.handleReset();
    setTokens([]);
  };
  const sendTest = (e) => {
    e.preventDefault();
    setTestMode(true);
    formik.handleSubmit();
  };
  const sendForReal = async (e) => {
    e.preventDefault();
    setTestMode(false);
    formik.handleSubmit();
  };

  return (
    <div>
      <Layouts.Header
        title={formatMessage({
          id: getTrad("plugin.name"),
          defaultMessage: "My notifications",
        })}
        subtitle={`${count} ${formatMessage({
          id: getTrad("header.subtitle"),
          defaultMessage: "sent notifications",
        })}`}
        as="h2"
      />
      <Layouts.Content>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Sender
            formik={formik}
            sendTest={sendTest}
            sendForReal={sendForReal}
            testToken={testToken}
          />
          <Receivers
            receivers={receivers}
            receiversCount={receiversCount}
            tokens={tokens}
            setTokens={setTokens}
            addToken={addToken}
            removeToken={removeToken}
            addAll={addAll}
            removeAll={removeAll}
          />
        </div>
        <div style={{ paddingTop: 12 }}>
          <Routes>
            <Route
              path={`/plugins/${pluginId}`}
              element={
                <Sent
                  notifications={notifications}
                  count={count}
                  isLoading={isLoading}
                />
              }
            />
            <Route path="*" element={<Empty />} />
          </Routes>
        </div>
      </Layouts.Content>
    </div>
  );
}
