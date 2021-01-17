export default (
  {
    VK_WIDGET_TYPE,
    VK_API_VERSION,
  },
) => {
  const send = async ({ widgetToken, widget }) => ({
    VK_WIDGET_TYPE,
    VK_API_VERSION,
    widget,
    widgetToken,
  });

  return {
    send,
  };
};
