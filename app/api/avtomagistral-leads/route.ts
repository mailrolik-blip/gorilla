import { sendAvtomagistralLead, type AvtomagistralLead } from '@/lib/mail/send-avtomagistral-lead';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type LeadPayload = AvtomagistralLead & {
  companyWebsite?: string;
};

const allowedFields = [
  'formType',
  'name',
  'phone',
  'service',
  'address',
  'region',
  'equipment',
  'quantity',
  'workFormat',
  'comment',
  'source',
  'pageUrl',
  'createdAt',
] as const;

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return Response.json({ error: 'Некорректный JSON.' }, { status: 400 });
  }

  if (String(payload.companyWebsite || '').trim()) {
    return Response.json({ ok: true });
  }

  const lead = normalizeLead(payload);

  if (!lead.formType || !lead.name || !lead.phone) {
    return Response.json({ error: 'Заполните имя, телефон и тип формы.' }, { status: 400 });
  }

  const hasMeaningfulContent = allowedFields.some((field) => Boolean(String(lead[field] || '').trim()));

  if (!hasMeaningfulContent) {
    return Response.json({ error: 'Пустая заявка не отправлена.' }, { status: 400 });
  }

  try {
    await sendAvtomagistralLead(lead);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Failed to send avtomagistral lead', error);
    return Response.json({ error: 'Не удалось отправить заявку. Попробуйте позже.' }, { status: 502 });
  }
}

function normalizeLead(payload: LeadPayload): AvtomagistralLead {
  return {
    formType: clean(payload.formType),
    name: clean(payload.name),
    phone: clean(payload.phone),
    service: clean(payload.service),
    address: clean(payload.address),
    region: clean(payload.region),
    equipment: clean(payload.equipment),
    quantity: clean(payload.quantity),
    workFormat: clean(payload.workFormat),
    comment: clean(payload.comment),
    source: clean(payload.source),
    pageUrl: clean(payload.pageUrl),
    createdAt: clean(payload.createdAt) || new Date().toISOString(),
  };
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 4000) : '';
}
