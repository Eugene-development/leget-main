<script lang="ts">
	// Артикулы: 1.42.1.1, 2.15.1.1, 3.10.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { blockTheme } from '$lib/utils/block-theme';
	import {
		operatorFields,
		privacyFields,
		privacySections,
		privacyValue,
		type PrivacyField
	} from './privacy-policy';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const theme = $derived(blockTheme(data));
	const hasOperator = $derived(
		['operatorName', 'address', 'email', 'domains'].every((key) =>
			privacyValue(data, key as PrivacyField)
		)
	);

	async function saveField(key: PrivacyField, value: string) {
		if (!isEditable || !editContext) return;
		const updated = { ...data, [key]: value.trim() };
		await saveComponentData(editContext, 'PrivacyPolicy', updated);
		data = updated;
	}
</script>

{#snippet companyField(key: PrivacyField, showLabel = true)}
	{@const field = privacyFields[key]}
	<div class="company-field">
		{#if showLabel}<p class="field-label">{field.label}</p>{/if}
		<EditableField
			fieldKey={`PrivacyPolicy.${key}`}
			label={field.label}
			value={privacyValue(data, key)}
			{isEditable}
			multiline
			richText={false}
			onSave={(value) => saveField(key, value)}
		>
			{#snippet children(value)}
				<p class="field-value" class:unfilled={!value.trim()}>
					{value.trim() || (isEditable ? field.placeholder : 'Не указано оператором сайта')}
				</p>
			{/snippet}
		</EditableField>
	</div>
{/snippet}

<section class="privacy-policy" data-policy-theme={theme} aria-labelledby="privacy-title">
	<div class="policy-container">
		<header class="policy-header">
			<a class="home-link" href="/">Главная</a>
			<h1 id="privacy-title" class="text-4xl sm:text-5xl">Политика конфиденциальности</h1>
			<p class="policy-intro">
				Как мы обрабатываем персональные данные и как вы можете управлять ими.
			</p>
			{@render companyField('effectiveDate')}
		</header>

		{#if isEditable}
			<aside class="editor-note" aria-label="Редактирование политики">
				<p>Заполните сведения вашей компании с помощью карандаша у каждого поля.</p>
				<p>
					Реквизиты и условия сохраняются только для этого сайта. Общие разделы едины для всех
					сайтов. Укажите фактические цели, сроки и подключённые сервисы перед публикацией.
				</p>
			</aside>
		{:else if !hasOperator}
			<p class="editor-note">
				Оператор сайта ещё не заполнил все сведения о себе и контактах для обращений по персональным
				данным.
			</p>
		{/if}

		<div class="policy-layout">
			<nav class="policy-navigation" aria-label="Содержание политики">
				<p class="navigation-title">В этом документе</p>
				<ol>
					{#each privacySections as section}
						<li><a href={`#privacy-${section.id}`}>{section.title}</a></li>
					{/each}
				</ol>
			</nav>

			<article class="policy-body" aria-label="Условия обработки персональных данных">
				<section id="privacy-operator">
					<h2 class="text-2xl sm:text-3xl">1. Оператор и область действия</h2>
					<p>
						Эта политика определяет порядок обработки персональных данных посетителей и
						пользователей сайтов, перечисленных ниже. Оператором является указанная в этом разделе
						организация или индивидуальный предприниматель.
					</p>
					<div class="operator-details">
						{#each operatorFields as key}{@render companyField(key)}{/each}
					</div>
					<p>
						Обработка осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О
						персональных данных» и другими применимыми нормами законодательства Российской
						Федерации. Термин «мы» в этой политике означает оператора сайта.
					</p>
				</section>

				<section id="privacy-processing">
					<h2 class="text-2xl sm:text-3xl">2. Какие данные и для чего нужны</h2>
					<p>
						Мы обрабатываем данные для конкретных целей и только в необходимом для них объёме. В
						зависимости от используемой функции это могут быть имя, телефон, email, текст обращения
						и вложения, адрес оказания услуги, сведения об аккаунте и заказе, а также технические
						данные о работе сайта.
					</p>
					<p>
						Данные поступают от вас при заполнении форм и использовании сайта, от вашего
						уполномоченного представителя либо из другого законного источника. Технические сведения
						могут поступать автоматически при обращении к серверу и работе разрешённых сервисов.
					</p>
					{@render companyField('processingDetails')}
					<p>
						В зависимости от цели основанием служат согласие, заключение договора по вашей
						инициативе, исполнение договора, обязанность по закону либо иное предусмотренное законом
						основание. Договорное основание охватывает только необходимую для договора обработку.
						Необязательные рекламные цели не включаются в него автоматически.
					</p>
					<p>
						Обработка может включать сбор, запись, систематизацию, накопление, хранение, уточнение,
						извлечение, использование, предоставление доступа уполномоченным получателям,
						блокирование, удаление и уничтожение. Она осуществляется с применением средств
						автоматизации и, при работе с обращениями и документами, без них.
					</p>
					<p>
						Не указывайте в свободных полях сведения о здоровье, убеждениях и другие специальные
						категории данных, если для этого не предусмотрены отдельные законные условия. Отправка
						заявки сама по себе не разрешает открыто публиковать её содержимое.
					</p>
				</section>

				<section id="privacy-sharing">
					<h2 class="text-2xl sm:text-3xl">3. Кому доступны данные</h2>
					<p>
						Обращения сохраняются в системе сайта. Для ответа доступ к ним получают уполномоченные
						сотрудники оператора. Уведомления могут направляться им по электронной почте. Доступ
						сотрудников ограничивается их задачами и полномочиями.
					</p>
					<p>
						Для работы сайта оператор может привлекать поставщиков технических услуг. Когда
						обработка поручается другому лицу, условия поручения определяют цели, данные, допустимые
						операции и требования к их защите. Роль поставщика и основание передачи зависят от
						конкретной услуги.
					</p>
					{@render companyField('recipients')}
					<p>
						Государственным органам данные предоставляются при наличии законного основания и в
						установленном порядке. Общедоступное распространение требует самостоятельного основания
						и, когда необходимо, отдельного согласия.
					</p>
				</section>

				<section id="privacy-cookies">
					<h2 class="text-2xl sm:text-3xl">4. Cookie и аналитика</h2>
					<p>
						Cookie и хранилища браузера могут использоваться для входа, сохранения состояния и
						настроек. Ограничение необходимых хранилищ может потребовать повторного входа или
						повлиять на отдельные функции сайта.
					</p>
					<p>
						Состав необязательной аналитики зависит от настроек сайта. Идентификаторы браузера и
						связанные с ними события не считаются автоматически анонимными. Ни ознакомление с
						политикой, ни продолжение просмотра сами по себе не заменяют согласие, когда оно
						требуется.
					</p>
					{@render companyField('analyticsDetails')}
				</section>

				<section id="privacy-retention">
					<h2 class="text-2xl sm:text-3xl">5. Хранение и удаление</h2>
					<p>
						Данные хранятся не дольше, чем нужно для цели обработки, если иной срок не установлен
						законом или договором. Для разных целей и документов могут действовать разные сроки.
					</p>
					{@render companyField('retentionDetails')}
					<p>
						После достижения цели или отзыва согласия данные уничтожаются в срок до 30 дней при
						отсутствии оснований для продолжения обработки, предусмотренных законом или договором.
						Отзыв согласия не отменяет обязательное хранение документов по закону.
					</p>
					<p>
						При сборе через интернет данных граждан Российской Федерации применяются требования
						законодательства РФ о локализации баз данных. До начала трансграничной передачи оператор
						выполняет применимые требования закона, включая уведомление уполномоченного органа в
						установленном порядке.
					</p>
					{@render companyField('storageDetails')}
					{@render companyField('crossBorderDetails')}
				</section>

				<section id="privacy-security">
					<h2 class="text-2xl sm:text-3xl">6. Защита данных</h2>
					<p>
						Оператор обязан обеспечивать конфиденциальность данных и принимать правовые,
						организационные и технические меры против неправомерного доступа, раскрытия, изменения,
						утраты и уничтожения. Меры определяются с учётом характера данных и угроз.
					</p>
					<p>
						При выявлении нарушений оператор принимает меры по их устранению, блокированию или
						уничтожению неправомерно обрабатываемых данных и выполняет установленные законом
						обязанности по реагированию и уведомлению.
					</p>
				</section>

				<section id="privacy-rights">
					<h2 class="text-2xl sm:text-3xl">7. Ваши права и обращения</h2>
					<p>
						Вы вправе получить сведения об обработке и доступ к своим данным, потребовать уточнения,
						блокирования или уничтожения в предусмотренных законом случаях, отозвать согласие,
						отказаться от рекламных сообщений и обжаловать обработку в Роскомнадзор или суд.
					</p>
					<p>
						Направьте запрос по email или почтовому адресу оператора из первого раздела. Укажите
						суть обращения и контакт для ответа. Для поиска данных можно сообщить email аккаунта,
						телефон или номер заявки. Для защиты данных оператор вправе запросить соразмерное
						подтверждение личности или полномочий представителя. К формальному запросу применяются
						требования статьи 14 Закона № 152-ФЗ.
					</p>
					<p>
						Информация по надлежащему запросу предоставляется бесплатно в течение 10 рабочих дней.
						Допустимое продление — не более 5 рабочих дней с мотивированным уведомлением.
						Подтверждённые неточности исправляются в течение 7 рабочих дней.
					</p>
					<p>
						По требованию о прекращении обработки срок её прекращения составляет до 10 рабочих дней
						с возможным продлением не более чем на 5 рабочих дней при мотивированном уведомлении,
						кроме предусмотренных законом случаев продолжения обработки. Для уничтожения данных
						применяются специальные сроки и условия закона.
					</p>
					<p>
						Для отзыва согласия укажите, от какой обработки вы отказываетесь. Рекламные сообщения
						после требования об отказе прекращаются; необходимые сообщения об исполнении договора и
						безопасности могут направляться на самостоятельном законном основании.
					</p>
				</section>

				<section id="privacy-changes">
					<h2 class="text-2xl sm:text-3xl">8. Согласия и изменения политики</h2>
					<p>
						Политика объясняет обработку данных и сама по себе не является согласием на неё.
						Согласие, когда оно требуется, оформляется отдельно от иных подтверждаемых документов.
						Для рекламы и других самостоятельных целей необходимо соответствующее добровольное
						согласие.
					</p>
					<p>
						Актуальная редакция размещается на этой странице с датой вступления в силу. Изменение
						текста не расширяет ранее данное согласие автоматически. При необходимости для новых
						целей обработки запрашивается новое согласие.
					</p>
					{#if isEditable || privacyValue(data, 'additionalTerms')}
						{@render companyField('additionalTerms')}
					{/if}
				</section>
			</article>
		</div>
	</div>
</section>

<style>
	.privacy-policy {
		--policy-surface: var(--ds-light-surface);
		--policy-title: var(--ds-light-title);
		--policy-body: var(--ds-light-body);
		--policy-border: var(--ds-light-border);
		--policy-paper: var(--ds-light-surface-paper);
		--policy-link: var(--ds-link-700);
		background: var(--policy-surface);
		color: var(--policy-body);
		padding-block: var(--ds-spacing-section-sm);
	}
	.privacy-policy[data-policy-theme='dark'] {
		--policy-surface: var(--ds-dark-surface);
		--policy-title: var(--ds-dark-title);
		--policy-body: var(--ds-dark-body);
		--policy-border: var(--ds-dark-border);
		--policy-paper: var(--ds-dark-surface-paper);
		--policy-link: var(--ds-link-300);
	}
	.policy-container {
		max-width: 1200px;
		margin-inline: auto;
		padding: 2rem 1.5rem;
	}
	.policy-header {
		max-width: 72ch;
		margin-bottom: 3rem;
	}
	.home-link {
		display: inline-block;
		margin-bottom: 2rem;
	}
	h1,
	h2 {
		color: var(--policy-title);
		text-wrap: balance;
		overflow-wrap: anywhere;
	}
	h1 {
		margin-bottom: 1.5rem;
	}
	.policy-intro {
		margin-bottom: 1.5rem;
	}
	.policy-layout {
		display: grid;
		gap: 3rem;
	}
	.policy-body {
		min-width: 0;
		max-width: 72ch;
	}
	.policy-body > section {
		scroll-margin-top: 10rem;
	}
	.policy-body > section + section {
		margin-top: 3.5rem;
	}
	h2 {
		margin-bottom: 1.25rem;
	}
	.policy-body p,
	.editor-note p,
	.policy-intro {
		line-height: 1.75;
	}
	.policy-body p + p,
	.editor-note p + p {
		margin-top: 1rem;
	}
	.company-field {
		margin-block: 1.25rem;
		min-width: 0;
	}
	.field-label {
		color: var(--policy-title);
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.375rem;
	}
	.field-value {
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.unfilled {
		font-style: italic;
	}
	.operator-details {
		border-block: 1px solid var(--policy-border);
		margin-block: 1.75rem;
		padding-block: 0.25rem;
	}
	.editor-note {
		padding: 1.25rem 1.5rem;
		margin-bottom: 3rem;
		background: var(--policy-paper);
		border: 1px solid var(--policy-border);
		max-width: 72ch;
	}
	.navigation-title {
		color: var(--policy-title);
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}
	.policy-navigation ol {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.875rem;
	}
	.policy-navigation a,
	.home-link {
		color: var(--policy-link);
		text-underline-offset: 0.25em;
		text-decoration-thickness: 1px;
	}
	.policy-navigation a {
		font-size: 0.875rem;
		line-height: 1.5;
	}
	a:hover {
		text-decoration-line: underline;
	}
	a:focus-visible {
		outline: 2px solid var(--policy-link);
		outline-offset: 4px;
		border-radius: 2px;
	}
	::selection {
		color: var(--policy-surface);
		background: var(--policy-title);
	}
	@media (min-width: 1024px) {
		.policy-layout {
			grid-template-columns: 240px minmax(0, 1fr);
			gap: 4rem;
		}
		.policy-navigation {
			align-self: start;
			position: sticky;
			top: 10rem;
		}
		.policy-header,
		.editor-note {
			margin-left: calc(240px + 4rem);
		}
	}
</style>
