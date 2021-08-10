import Vue from 'vue';
export interface SlTreeNodeModel<TDataType> {
  title: string;
  isLeaf?: boolean;
  children?: SlTreeNodeModel<TDataType>[];
  isExpanded?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
  isSelectable?: boolean;
  data?: TDataType;
  tag?: object;
  isNested?: boolean;
}
export interface SlTreeNode<TDataType> extends SlTreeNodeModel<TDataType> {
  isVisible?: boolean;
  isFirstChild: boolean;
  isLastChild: boolean;
  ind: number;
  level: number;
  path: number[];
  pathStr: string;
  children: SlTreeNode<TDataType>[];
}
export interface CursorPosition<TDataType> {
  node: SlTreeNode<TDataType>;
  placement: 'before' | 'inside' | 'after';
}
export interface VueData<TDataType> {
  rootCursorPosition: CursorPosition<TDataType>;
  rootDraggingNode: SlTreeNode<TDataType>;
}
export default class SlVueTree<TDataType> extends Vue {
  value: SlTreeNodeModel<TDataType>[];
  edgeSize: number;
  allowMultiselect: boolean;
  showBranches: boolean;
  level: number;
  parentInd: number;
  allowToggleBranch: boolean;
  private rootCursorPosition;
  private rootDraggingNode;
  cursorPosition: CursorPosition<TDataType>;
  draggingNode: SlTreeNode<TDataType>;
  readonly nodes: SlTreeNode<TDataType>[];
  getNode(path: number[]): SlTreeNode<TDataType>;
  getFirstNode(): SlTreeNode<TDataType>;
  getLastNode(): SlTreeNode<TDataType>;
  getNextNode(path: number[], filter?: (node: SlTreeNode<TDataType>) => boolean): SlTreeNode<TDataType>;
  getPrevNode(path: number[], filter?: (node: SlTreeNode<TDataType>) => boolean): SlTreeNode<TDataType>;
  updateNode(path: number[], patch: Partial<SlTreeNodeModel<TDataType>>): void;
  getSelected(): SlTreeNode<TDataType>[];
  traverse(
    cb: (node: SlTreeNode<TDataType>, nodeModel: SlTreeNodeModel<TDataType>, siblings: SlTreeNodeModel<TDataType>[]) => boolean | void,
    nodeModels?: SlTreeNodeModel<TDataType>[],
    parentPath?: number[]
  ): SlTreeNode<TDataType>[] | boolean;
  getNodeEl(path: number[]): HTMLElement;
  select(path: number[], addToSelection?: boolean): SlTreeNode<TDataType>;
  remove(paths: number[][]): void;
  insert(cursorPosition: CursorPosition<TDataType>, nodeModel: SlTreeNodeModel<TDataType>): void;
}
