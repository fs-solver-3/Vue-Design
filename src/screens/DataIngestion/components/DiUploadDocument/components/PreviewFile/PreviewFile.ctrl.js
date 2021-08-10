import DocumentService from '../../services/DocumentService';
import UploadDocumentStageMixin from '../../mixins/UploadDocumentStage.mixin';
import { COLUMN_DATA_TYPE, COLUMN_DATA_TYPE_NAME, DELIMITER, ENCODING } from '../../entities/Enum';
import UploadDocumentService from '../../services/UploadDocumentService';
import { Log } from '@core/utils';

export default {
  name: 'PreviewFiles',
  mixins: [UploadDocumentStageMixin],
  data() {
    return {
      COLUMN_DATA_TYPE_NAME,
      encodings: Object.values(ENCODING),
      delimiters: Object.values(DELIMITER),
      classNames: Object.values(COLUMN_DATA_TYPE).map(id => ({ id, name: COLUMN_DATA_TYPE_NAME[id] })),
      records: []
    };
  },
  mounted() {
    this.initChunkContainer();
  },
  methods: {
    async initChunkContainer() {
      this.loading = true;
      this.value.chunkContainer = DocumentService.initChunkContainer(this.value.files[0], this.value.setting.chunkSize);
      if (this.value.chunkContainer.total <= 0) {
        this.error = 'File is empty. Please choose another file!';
      } else {
        this.error = '';
        await DocumentService.readChunk(this.value.files[0], this.value.chunkContainer, this.value.setting.chunkSize, this.value.setting.encoding);
        await this.calcPreviewData();
      }
      this.loading = false;
    },
    async calcPreviewData(previewWithSchema = false) {
      this.loading = true;
      //let -> const
      const previewData = this.value.chunkContainer.prevProcessItem.lines.join('\n');
      let schema = undefined;
      if (previewWithSchema) {
        schema = this.value.schema.serialize;
      }
      const resp = await UploadDocumentService.preview(previewData, this.value.setting.serialize, schema);
      if (resp.error) {
        this.error = resp.message;
      } else {
        this.error = '';
        this.previewData = resp.data;
        this.value.schema = resp.data.schema;
        this.records = resp.data.records;
      }
      this.loading = false;
      Log.debug(resp);
    },
    changeColumnClassName(column, newClassName) {
      column.class_name = newClassName.id;
      this.calcPreviewData(true);
    },
    changeEncoding(newEncoding) {
      if (!this.value.setting.encoding !== newEncoding) {
        this.value.setting.encoding = newEncoding;
        this.initChunkContainer();
      }
    },
    changeDelimiter(newDelimiter) {
      if (!this.value.setting.delimiter !== newDelimiter) {
        this.value.setting.delimiter = newDelimiter;
        this.calcPreviewData();
      }
    }
  }
};
