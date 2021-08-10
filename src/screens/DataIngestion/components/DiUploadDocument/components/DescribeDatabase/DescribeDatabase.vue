<template>
  <div>
    <div class="row">
      <div class="col-12">
        <div class="describe-db mx-auto">
          <div class="form-group" :class="{ 'is-invalid': database.error }">
            <label>Select or create new database</label>
            <DiDropdown
              id="di-database-selection"
              v-model="database.selected"
              @selected="selectDatabase"
              :data="database.items"
              valueProps="name"
              labelProps="display_name"
              :placeholder="databasePlaceholder"
              :class="{ 'is-invalid': !database.createNew && database.error }"
              hidePlaceholderOnMenu
            >
              <template slot="before-menu" slot-scope="{ hideDropdown }">
                <li @click.prevent="selectNewDatabaseOption(hideDropdown)" class="active color-di-primary font-weight-normal">
                  Create new database
                </li>
              </template>
            </DiDropdown>
            <!--            <div class="dropdown" :class="{ 'is-invalid': !database.createNew && database.error }">-->
            <!--              <button :disabled="database.loading" class="btn btn-di-default w-100 dropdown-toggle" data-toggle="dropdown">-->
            <!--                <span v-if="database.createNew">Create new database</span>-->
            <!--                <span v-else-if="database.model">{{ database.model.display_name || database.model.name }}</span>-->
            <!--                <span v-else>Select database...</span>-->
            <!--              </button>-->
            <!--              <div class="dropdown-menu w-100">-->
            <!--                <a @click.prevent="selectNewDatabaseOption" href="#" class="dropdown-item color-di-primary">Create new database</a>-->
            <!--                <a @click.prevent="selectDatabase(db)" v-for="db in database.items" :key="db.name" href="#" class="dropdown-item">-->
            <!--                  <span v-if="db.display_name">{{ db.display_name }}</span>-->
            <!--                  <span v-else class="text-muted">{{ db.name }}</span>-->
            <!--                </a>-->
            <!--              </div>-->
            <!--            </div>-->
            <input
              v-if="database.createNew"
              v-model.trim="database.createNewModel"
              ref="newDatabase"
              type="text"
              class="form-control mt-3"
              placeholder="Input name new database"
              :class="{ 'is-invalid': database.error }"
              @input="resetDatabaseError"
            />
            <div class="invalid-feedback" v-html="database.error"></div>
          </div>
          <div class="form-group">
            <label>Select or create new table</label>
            <div>
              <DiDropdown
                id="di-table-selection"
                v-model="table.selected"
                @selected="selectTable"
                :data="table.items"
                valueProps="name"
                labelProps="display_name"
                :placeholder="tablePlaceholder"
                :class="{ 'is-invalid': !table.createNew && table.error }"
                hidePlaceholderOnMenu
              >
                <template slot="before-menu" slot-scope="{ hideDropdown }">
                  <li @click.prevent="selectNewTableOption(hideDropdown)" class="active color-di-primary font-weight-normal">
                    Create new table
                  </li>
                </template>
              </DiDropdown>
            </div>
            <!--            <div class="dropdown" :class="{ 'is-invalid': !table.createNew && table.error }">-->
            <!--              <button :disabled="table.loading || !database.model" class="btn btn-di-default w-100 dropdown-toggle" data-toggle="dropdown">-->
            <!--                <span v-if="table.createNew">Create new table</span>-->
            <!--                <span v-else-if="table.model">{{ table.model.display_name || table.model.name }}</span>-->
            <!--                <span v-else>Select table...</span>-->
            <!--              </button>-->
            <!--              <div class="dropdown-menu w-100">-->
            <!--                <a @click.prevent="selectNewTableOption" href="#" class="dropdown-item color-di-primary">Create new table</a>-->
            <!--                <a @click.prevent="selectTable(tb)" v-for="tb in table.items" :key="tb.name" href="#" class="dropdown-item">-->
            <!--                  <span v-if="tb.display_name">{{ tb.display_name }}</span>-->
            <!--                  <span v-else class="text-muted">{{ tb.name }}</span>-->
            <!--                </a>-->
            <!--              </div>-->
            <!--            </div>-->
            <input
              v-if="table.createNew"
              v-model.trim="table.createNewModel"
              ref="newTable"
              type="text"
              class="form-control mt-3"
              placeholder="Input name new database"
              :class="{ 'is-invalid': table.error }"
              @input="resetTableError"
            />
            <div class="invalid-feedback" v-html="table.error"></div>
          </div>
          <div v-if="error" class="form-group">
            <strong class="invalid-feedback d-block" v-html="error"></strong>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-right">
        <button @click.prevent="back" class="btn btn-di-transparent">Back</button>
        <button :disabled="loading" @click.prevent="register" class="btn btn-di-primary">Next</button>
      </div>
    </div>
  </div>
</template>
<style>
.describe-db {
  width: 100%;
  max-width: 446px;
  background-color: #2d303c;
  padding: 48px;
  margin: 48px 0;
  border-radius: 4px;
}
</style>
<script src="./DescribeDatabase.ctrl.js"></script>
