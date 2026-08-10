export function buildInboxUrl(params: {
  pageId: string;
  businessId: string;
  psid: string;
}): string {
  const query = new URLSearchParams({
    asset_id: params.pageId,
    business_id: params.businessId,
    ir_qe_exposed: "1",
    selected_item_id: params.psid,
    thread_type: "FB_MESSAGE",
    mailbox_id: params.pageId,
  });
  return `https://business.facebook.com/latest/inbox/all?${query.toString()}`;
}
