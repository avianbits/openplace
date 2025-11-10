<template>
	<div
		v-if="isOpen"
		class="palette-container"
	>
		<Card class="palette-card" aria-labelledby="palette-label">
			<template #header>
				<div class="palette-header">
					<Icon name="paint" class="palette-header-icon" />

					<h3 id="palette-label" class="palette-header-label">
						Paint {{ pixelCount.toLocaleString() }} {{ pixelCount === 1 ? "pixel" : "pixels" }}
					</h3>

					<div class="palette-buttons">
						<Button
							v-tooltip.top="isEraserMode ? 'Switch to painting' : 'Switch to eraser'"
							:severity="isEraserMode ? 'danger' : 'secondary'"
							size="small"
							rounded
							:outlined="!isEraserMode"
							:aria-label="isEraserMode ? 'Switch to painting' : 'Switch to eraser'"
							@click="$emit('toggleEraser')"
						>
							<Icon name="eraser" />
						</Button>

						<Button
							v-tooltip.top="pixelCount === 0 ? 'Close' : 'Discard changes'"
							:severity="pixelCount === 0 ? 'secondary' : 'danger'"
							size="small"
							rounded
							text
							aria-label="Close"
							@click="$emit('close')"
						>
							<Icon name="close" />
						</Button>
					</div>
				</div>
			</template>

			<template #content>
				<div class="palette-body">
					<div class="color-grid">
						<Button
							v-for="item in palette"
							:key="item.index"
							v-tooltip.top="item.name"
							:class="['color-button', {
								'color-button--transparent': item.rgba[3] === 0,
								'color-button--selected': selectedColor === `rgba(${item.rgba.join(',')})`
							}]"
							:style="{ backgroundColor: `rgba(${item.rgba.join(',')})` }"
							:raised="selectedColor === `rgba(${item.rgba.join(',')})`"
							:disabled="!isColorUnlocked(item.index, extraColorsBitmap)"
							:aria-label="isColorUnlocked(item.index, extraColorsBitmap) ? 'Select color' : 'Color locked'"
							@click="$emit('colorSelect', `rgba(${item.rgba.join(',')})`)">
							<span/>
						</Button>
					</div>

					<PaintButton
						class="palette-paint-button"
						:charges="charges"
						:max-charges="maxCharges"
						:time-until-next="timeUntilNext"
						:is-drawing="true"
						:pending-pixels="pixelCount"
						@click="$emit('submit')"
					/>
				</div>
			</template>
		</Card>
	</div>
</template>

<script setup lang="ts">
import { isColorUnlocked, palette } from "../../utils/palette";
import Card from "primevue/card";
import Button from "primevue/button";

defineProps<{
	isOpen: boolean;
	selectedColor: string;
	isEraserMode: boolean;
	charges: number;
	maxCharges: number;
	pixelCount: number;
	timeUntilNext: string;
	extraColorsBitmap: number;
}>();

defineEmits<{
	colorSelect: [color: string];
	close: [];
	toggleEraser: [];
	submit: [];
}>();
</script>

<style scoped>
.palette-container {
	width: 100%;
}

.palette-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem var(--p-card-body-padding) 0 var(--p-card-body-padding);
	gap: 0.25rem;
	border-bottom: 1px solid var(--p-surface-border);
}

.palette-header-icon {
	font-size: 1.5rem;
}

.palette-header-label {
	font-size: 1.1rem;
	font-weight: 500;
	margin-block: 0;
	margin-inline-start: 0.25rem;
	margin-inline-end: auto;
	font-feature-settings: "tnum";
}

.palette-buttons {
	display: flex;
	gap: 0.5rem;
}

.palette-buttons > * {
	aspect-ratio: 1;
	font-size: 1rem;
}

.palette-body {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin: -0.5rem 0 -0.25rem 0;
}

.color-grid {
	--cols: 8;
	--gap: 0.25rem;
	display: grid;
	grid-template-columns: repeat(var(--cols), 1fr);
	grid-auto-flow: row;
	gap: var(--gap);
}

@media (min-width: 768px) {
	.color-grid {
		--cols: 16;
		--size: 35px;
	}
}

@media (min-width: 1500px) {
	.color-grid {
		--cols: 32;
	}
}

.color-button {
	min-width: 30px;
	min-height: 30px;
	padding: 0;
	min-width: 30px;
	border: 1px solid var(--p-button-outlined-secondary-border-color);
	border-radius: 6px;
}

@media (min-height: 700px) {
	.color-grid {
		--gap: 0.5rem;
	}

	.color-button {
		min-height: 40px;
	}
}

.color-button--selected,
.color-button--selected:hover,
.color-button--selected:active {
	border: 3px solid var(--p-primary-color);
}

.color-button:disabled {
	opacity: 0.3;
	cursor: not-allowed;
	position: relative;
}

/* TODO: Make this nicer */
.color-button:disabled::after {
	content: "🔒";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 12px;
	filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
}

.color-button--transparent::before {
	content: "";
	position: absolute;
	inset: 0;
	background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M0 0h8v16h8V8H0z' fill='%23000' fill-opacity='.2'/%3E%3C/svg%3E") 0 0/50% 50% repeat;
}

@media (prefers-color-scheme: dark) {
	.color-button--transparent::before {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M0 0h8v16h8V8H0z' fill='%23fff' fill-opacity='.2'/%3E%3C/svg%3E");
	}
}

.palette-paint-button {
	align-self: center;
	margin-inline: auto;
}
</style>
