<template>
  <v-btn
    rounded="0"
    variant="text"
    size="x-small"
    :class="[ `file-icon-${size}`, `file-icon-button`, disabled ? 'file-icon-disabled' : '' ]"
    @click.stop="$emit('click')"
  >
    <v-icon
      :class="[ `file-icon-icon`, expanded ? 'file-icon-expanded' : '', badge ? `file-icon-icon-badged` : '' ]"
    >
      {{ icon }}
    </v-icon>
    <v-icon
      v-if="badge"
      :key="path"
      :class="[ `file-icon-badge`, expanded ? 'file-icon-expanded' : '', modifier ]"
      :color="alert ? 'red' : ''"
    >
      {{ badge }}
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VBtn, VIcon } from 'vuetify/components'

@Component({
  components: { VBtn, VIcon }
})
class FileIcon extends Vue {
  @Prop({ default: '' })
  path: string

  @Prop({ default: '' })
  extension: string

  @Prop({ default: '' })
  relationship: string

  @Prop({ default: false })
  directory: boolean

  @Prop({ default: false })
  expanded: boolean

  @Prop({ default: false })
  selected: boolean

  @Prop({ default: false })
  image: boolean

  @Prop({ default: false })
  alert: boolean

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: 'small' })
  size: string

  get system () {
    return ['git', 'tome', 'tome-templates', 'tome-actions'].includes(this.relationship)
  }

  get icon () {
    if (this.directory) {
      if (this.relationship === 'root') {
        return this.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
      }

      return this.expanded ? 'mdi-folder-open' : 'mdi-folder'
    }

    if (this.image) {
      return 'mdi-image'
    }

    if (this.relationship === 'tome-file') {
      return 'mdi-file'
    }

    return 'mdi-newspaper-variant'
  }

  get badge () {
    const base = this.alert ? 'mdi-alert-circle' : ''

    switch (this.relationship) {
      case 'root':
        return ''

      case 'git':
        return 'mdi-lock'

      case 'tome':
        return this.expanded ? 'mdi-eye-circle' : 'mdi-minus-circle'

      case 'tome-feature-actions':
      case 'tome-feature-templates':
        return 'mdi-cog'

      case 'tome-action':
        return 'mdi-play-circle'

      case 'tome-template':
        return 'mdi-lightning-bolt-circle'
    }

    if (this.image) {
      return base
    }

    if (this.relationship === 'tome-file') {
      switch (this.extension) {
        case '.md':
          return 'mdi-arrow-down-bold-circle'

        case '.js':
          return 'mdi-language-javascript'

        case '.json':
          return 'mdi-code-json'
      }
    }

    return base
  }

  get modifier () {
    switch (this.badge) {
      case 'mdi-cog':
        return 'modify-cog'

      case 'mdi-eye-circle':
        return 'modify-eye'

      case 'mdi-language-javascript':
        return 'modify-js'

      case 'mdi-lock':
        return 'modify-lock'

      case 'mdi-code-json':
        return 'modify-json'
    }

    return ''
  }
}

export default toNative(FileIcon)
</script>

<style>
.file-icon-disabled,
.file-icon-disabled * {
  pointer-events: none !important;
}

:root {
  --tome-file-icon-small: 1;
  --tome-file-icon-large: 8;
}

.file-icon-small {
  --tome-file-icon-factor: var(--tome-file-icon-small);
}

.file-icon-large {
  --tome-file-icon-factor: var(--tome-file-icon-large);
}

.file-icon-button {
  --tome-file-icon-button: calc(var(--tome-file-icon-factor) * 20px);

  width: var(--tome-file-icon-button) !important;
  min-width: var(--tome-file-icon-button) !important;
  height: var(--tome-file-icon-button) !important;
  min-height: var(--tome-file-icon-button) !important;
  padding: 0 !important;
}

.file-icon-icon {
  --tome-file-icon-icon: calc(var(--tome-file-icon-factor) * 14px);

  font-size: var(--tome-file-icon-icon) !important;
}

.file-icon-icon-badged {
  --tome-file-icon-icon-badged-circle-x: calc(100% - (var(--tome-file-icon-factor) * 0.5 * 10px));
  --tome-file-icon-icon-badged-circle-y: calc(100% - (var(--tome-file-icon-factor) * 0.5 * 7px));
  --tome-file-icon-icon-badged-gradient: calc(var(--tome-file-icon-factor) * 0.5 * 9px);
  --tome-file-icon-icon-badged-gradient-edge: calc((var(--tome-file-icon-factor) * 0.5 * 9px) + 1px);

  mask-image:
    radial-gradient(
      circle at var(--tome-file-icon-icon-badged-circle-x) var(--tome-file-icon-icon-badged-circle-y),
      rgba(0, 0, 0, 0) var(--tome-file-icon-icon-badged-gradient),
      rgba(0, 0, 0, 1) var(--tome-file-icon-icon-badged-gradient-edge)
    );
}

.file-icon-icon-badged.file-icon-expanded {
  --tome-file-icon-icon-badged-circle-y: calc(100% - (var(--tome-file-icon-factor) * 0.5 * 5px));
}

.v-icon.v-icon.file-icon-badge {
  --tome-file-icon-badge: calc(var(--tome-file-icon-factor) * 10px);
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 9px);
  --tome-file-icon-badge-gradient: calc(var(--tome-file-icon-factor) * 0.5 * 7px);
  --tome-file-icon-badge-gradient-edge: calc((var(--tome-file-icon-factor) * 0.5 * 7px) + 1px);
  --tome-file-icon-badge-bottom: calc(var(--tome-file-icon-factor) * 0.5 * -3px);
  --tome-file-icon-badge-right: calc(var(--tome-file-icon-factor) * 0.5 * 6px);

  position: absolute;
  width: var(--tome-file-icon-badge) !important;
  min-width: var(--tome-file-icon-badge) !important;
  height: var(--tome-file-icon-badge) !important;
  min-height: var(--tome-file-icon-badge) !important;
  mask-image:
    radial-gradient(
      rgba(0, 0, 0, 1) var(--tome-file-icon-badge-gradient),
      rgba(0, 0, 0, 0) var(--tome-file-icon-badge-gradient-edge)
    );
  font-size: var(--tome-file-icon-badge-font) !important;
  bottom: var(--tome-file-icon-badge-bottom);
  right: var(--tome-file-icon-badge-right);
}

.v-icon.v-icon.file-icon-badge.file-icon-expanded {
  --tome-file-icon-badge-bottom: calc(var(--tome-file-icon-factor) * -2.5px);
}

@keyframes rotating {
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.file-icon-large .modify-cog {
  animation: rotating 2s linear infinite;
}

.modify-book {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 12px) !important;
}

.modify-eye {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 10px) !important;
}

.modify-js {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 11.25px) !important;
}

.modify-lock,
.modify-json {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 7.5px) !important;
}

.v-btn.file-icon-button:active .modify-lock,
.modify-lock:active {
  color: darkorange !important;
}
</style>
