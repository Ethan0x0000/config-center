<template>
  <div class="wrapper">
    <div :id="editorId" class="monaco-editor"></div>
  </div>
</template>

<script setup>
import * as monaco from 'monaco-editor'
import { ref, defineProps, defineEmits, onMounted, toRaw } from 'vue'
import _ from 'lodash'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  editorTheme: {
    type: String,
    default: 'vs',
  },
  language: {
    type: String,
    default: 'json',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
})

const editor = ref(null)
const emit = defineEmits(['change'])
const editorId = ref(`codeEditer-${Date.now()}`)

const getVal = () => {
  return toRaw(editor.value).getValue() //获取编辑器中的文本
}

const emitChange = _.debounce(function () {
  emit('change', getVal())
}, 300)

const initEditor = () => {
  editor.value = monaco.editor.create(document.getElementById(editorId.value), {
    value: props.content,
    language: props.language,
    theme: props.editorTheme,
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: props.readOnly,
    minimap: {
      enabled: true,
    },
    cursorStyle: 'line',
    automaticLayout: true,
    glyphMargin: false,
    useTabStops: false,
    fontSize: 15,
    autoIndent: true,
    quickSuggestionsDelay: 100,
    tabSize: 2,
  })

  editor.value.onDidChangeModelContent(() => {
    emitChange()
  })
}

onMounted(() => {
  initEditor()
})
</script>

<style scoped>
.wrapper {
  width: 100%;
}

.monaco-editor {
  font-family: consolas, Menlo, Monaco, monospace;
  width: 100%;
  height: 768px;
  border: 1px groove;
}
</style>